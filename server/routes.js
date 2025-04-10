import { createServer } from "http";
import { setupAuth } from "./auth.js";
import { User, Message, UserPreference } from "./models/index.js";
import { z } from "zod";

// Create a Zod schema for message validation
const insertMessageSchema = z.object({
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string().min(1)
});

// Roommate filter schema
const roommateFilterSchema = z.object({
  location: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  preferredGender: z.string().optional(),
  smoking: z.string().optional(),
  lifestyle: z.array(z.string()).optional(),
});

export async function registerRoutes(app) {
  // Set up authentication routes
  setupAuth(app);

  // API routes
  // Get user profile
  app.get("/api/profile/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.params.id;
      const user = await User.findById(userId).select("-password");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update user profile
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user?._id;
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        { $set: req.body },
        { new: true }
      ).select("-password");
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Search for roommates with filters
  app.post("/api/roommates/search", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user?._id;
      const filters = roommateFilterSchema.parse(req.body);
      
      // Create the MongoDB query
      const query = { _id: { $ne: userId } }; // Exclude current user
      
      if (filters.location) {
        query.location = { $regex: filters.location, $options: 'i' };
      }
      
      if (filters.budgetMin || filters.budgetMax) {
        query.budget = {};
        if (filters.budgetMin) query.budget.$gte = filters.budgetMin;
        if (filters.budgetMax) query.budget.$lte = filters.budgetMax;
      }
      
      if (filters.preferredGender) {
        query.gender = filters.preferredGender;
      }
      
      if (filters.smoking) {
        query.smoking = filters.smoking;
      }
      
      // Find matching roommates
      const roommates = await User.find(query).select("-password");
      
      res.json(roommates);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid filter parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Messages routes
  // Send a message
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const senderId = req.user?._id;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId
      });
      
      const message = new Message(messageData);
      await message.save();
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get conversation between two users
  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const currentUserId = req.user?._id;
      const otherUserId = req.params.userId;
      
      // Mark messages as read
      await Message.updateMany(
        { senderId: otherUserId, receiverId: currentUserId, read: false },
        { $set: { read: true } }
      );
      
      // Get messages between users
      const messages = await Message.find({
        $or: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ]
      }).sort({ createdAt: 1 });
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all conversations for a user
  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user?._id;
      
      // Find all unique users that the current user has exchanged messages with
      const messagePartners = await Message.aggregate([
        {
          $match: {
            $or: [{ senderId: userId }, { receiverId: userId }]
          }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$senderId", userId] },
                "$receiverId",
                "$senderId"
              ]
            },
            lastMessage: { $last: "$$ROOT" }
          }
        }
      ]);
      
      // Get user details for each conversation partner
      const conversations = await Promise.all(
        messagePartners.map(async (partner) => {
          const user = await User.findById(partner._id).select("-password");
          return {
            user,
            lastMessage: partner.lastMessage
          };
        })
      );
      
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
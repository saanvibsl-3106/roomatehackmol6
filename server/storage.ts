import { 
  users, messages, userPreferences,
  type User, type InsertUser,
  type Message, type InsertMessage,
  type UserPreferences, type InsertUserPreferences,
  type RoommateFilter
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  getConversations(userId: number): Promise<{user: User, lastMessage: Message}[]>;
  markMessagesAsRead(senderId: number, receiverId: number): Promise<void>;
  
  // Preferences operations
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
  
  // Search & matching
  searchRoommates(userId: number, filters: RoommateFilter): Promise<User[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private userPrefs: Map<number, UserPreferences>;
  private userIdCounter: number;
  private messageIdCounter: number;
  private prefIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.userPrefs = new Map();
    this.userIdCounter = 1;
    this.messageIdCounter = 1;
    this.prefIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...userData, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { ...messageData, id, createdAt: now };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (msg) => 
        (msg.senderId === user1Id && msg.receiverId === user2Id) ||
        (msg.senderId === user2Id && msg.receiverId === user1Id)
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getConversations(userId: number): Promise<{user: User, lastMessage: Message}[]> {
    // Get all users this user has exchanged messages with
    const allMessages = Array.from(this.messages.values())
      .filter(msg => msg.senderId === userId || msg.receiverId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const userConversations = new Map<number, Message>();
    
    // Find the last message with each user
    allMessages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!userConversations.has(otherUserId)) {
        userConversations.set(otherUserId, msg);
      }
    });
    
    // Format the result
    const result: {user: User, lastMessage: Message}[] = [];
    for (const [otherUserId, lastMessage] of userConversations.entries()) {
      const user = await this.getUser(otherUserId);
      if (user) {
        result.push({ user, lastMessage });
      }
    }
    
    return result;
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    for (const [id, message] of this.messages.entries()) {
      if (message.senderId === senderId && message.receiverId === receiverId && !message.read) {
        this.messages.set(id, { ...message, read: true });
      }
    }
  }
  
  // Preferences operations
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPrefs.values()).find(
      (prefs) => prefs.userId === userId
    );
  }

  async createUserPreferences(preferencesData: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.prefIdCounter++;
    const preferences: UserPreferences = { ...preferencesData, id };
    this.userPrefs.set(id, preferences);
    return preferences;
  }

  async updateUserPreferences(userId: number, preferencesData: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const preferences = Array.from(this.userPrefs.values()).find(
      (prefs) => prefs.userId === userId
    );
    
    if (!preferences) return undefined;
    
    const updatedPreferences = { ...preferences, ...preferencesData };
    this.userPrefs.set(preferences.id, updatedPreferences);
    return updatedPreferences;
  }
  
  // Search & matching
  async searchRoommates(userId: number, filters: RoommateFilter): Promise<User[]> {
    const allUsers = await this.getAllUsers();
    
    // Exclude the current user
    const potentialRoommates = allUsers.filter(user => user.id !== userId);
    
    if (!filters || Object.keys(filters).length === 0) {
      return potentialRoommates;
    }
    
    // Apply filters
    return potentialRoommates.filter(user => {
      let matches = true;
      
      if (filters.location && user.location) {
        matches = matches && user.location.toLowerCase().includes(filters.location.toLowerCase());
      }
      
      if (filters.budgetMin && user.budget) {
        matches = matches && user.budget >= filters.budgetMin;
      }
      
      if (filters.budgetMax && user.budget) {
        matches = matches && user.budget <= filters.budgetMax;
      }
      
      if (filters.preferredGender && filters.preferredGender !== 'any') {
        matches = matches && user.gender === filters.preferredGender;
      }
      
      if (filters.smoking && filters.smoking !== 'any') {
        matches = matches && user.smoking === filters.smoking;
      }
      
      // Additional lifestyle filters could be implemented here
      
      return matches;
    });
  }
}

export const storage = new MemStorage();

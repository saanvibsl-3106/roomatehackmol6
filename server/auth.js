import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { User } from "./models/index.js";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import { hashPassword, comparePasswords } from "./utils.js";

export function setupAuth(app) {
  // Use environment variable with fallback
  const sessionSecret = process.env.SESSION_SECRET || "roommate-match-secret";
  
  const sessionSettings = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
      mongoUrl: mongoose.connection.client.s.url,
      collection: 'sessions'
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash the password before storing
      const hashedPassword = await hashPassword(req.body.password);
      
      // Create a new user
      const newUser = new User({
        ...req.body,
        password: hashedPassword,
      });
      
      // Save the user to the database
      const user = await newUser.save();

      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json(userResponse);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        return res.status(200).json(userResponse);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    // Remove password from response
    const userResponse = req.user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  });
}
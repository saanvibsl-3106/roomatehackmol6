import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { log } from './vite.js';

let mongoServer;

const connectDB = async () => {
  try {
    // For production use process.env.MONGODB_URI
    // For development, we'll use an in-memory MongoDB server
    if (process.env.NODE_ENV === 'production' && process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      log(`MongoDB Connected to ${process.env.MONGODB_URI}`);
    } else {
      // Use in-memory MongoDB for development
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      log(`MongoDB Memory Server Connected: ${mongoUri}`);
      
      // Add some seed data for development
      await addSeedData();
    }
    
    return mongoose.connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Seed data function for development
async function addSeedData() {
  const { User } = await import('./models/index.js');
  const { hashPassword } = await import('./utils.js');
  
  // Check if we already have users
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    log('Seed data already exists');
    return;
  }
  
  log('Adding seed data...');
  
  // Create test user
  const testUser = new User({
    username: 'testuser',
    password: await hashPassword('password'),
    fullName: 'Test User',
    age: 25,
    gender: 'male',
    preferredGender: 'any',
    smoking: 'no',
    location: 'New York, NY',
    budget: 1500,
    cleanliness: 'clean',
    personality: 'ambivert',
    bio: 'Looking for a nice roommate in downtown area',
    moveInDate: '2023-10-01',
    hasPets: false
  });
  
  await testUser.save();
  log('Seed data added successfully');
}

// Disconnect from database when the app is shutting down
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    log('MongoDB disconnected on app termination');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

export default connectDB;
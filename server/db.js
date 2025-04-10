import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // In a production environment, you would use an environment variable
    // like process.env.MONGODB_URI for the connection string
    const conn = await mongoose.connect('mongodb://localhost:27017/roommatedb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
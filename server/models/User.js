import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  preferredGender: {
    type: String
  },
  smoking: {
    type: String
  },
  location: {
    type: String
  },
  budget: {
    type: Number
  },
  religion: {
    type: String
  },
  cleanliness: {
    type: String
  },
  personality: {
    type: String
  },
  bio: {
    type: String
  },
  moveInDate: {
    type: String
  },
  hasPets: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

export default User;
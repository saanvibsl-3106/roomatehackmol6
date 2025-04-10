import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  preferences: {
    type: Object,
    required: true
  }
});

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

export default UserPreference;
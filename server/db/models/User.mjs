import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },

  // ✅ Admin flag
  isAdmin: {
    type: Boolean,
    default: false
  },

  resetToken: String,
  resetTokenExpires: Date,
  languagePreference: String,
  experiencePreference: String,
  commitmentPreference: String,
  avatar: String,

  // ✅ Progress tracking
  progress: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    completedQuiz: { type: Boolean, default: false },
    recommendations: [String],
    updatedAt: { type: Date, default: Date.now }
  }]
},
{
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;

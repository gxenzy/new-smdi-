const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  emailNotifications: {
    type: Boolean,
    default: true
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'MODERATOR', 'STAFF', 'USER'],
    default: 'USER'
  },
  settings: {
    type: userSettingsSchema,
    default: () => ({})
  },
  profileImage: {
    type: String
  },
  lastLogin: {
    type: Date
  },
  notifications: [{
    message: String,
    type: {
      type: String,
      enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'],
      default: 'INFO'
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    link: String
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add index for faster queries
userSchema.index({ username: 1, email: 1 });

// Pre-save middleware to ensure required settings
userSchema.pre('save', function(next) {
  if (!this.settings) {
    this.settings = {
      emailNotifications: true,
      darkMode: false,
      language: 'en',
      timezone: 'UTC'
    };
  }
  next();
});

// Method to safely return user data without sensitive information
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ active: true });
};

// Method to check if user has specific role
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

// Method to add notification
userSchema.methods.addNotification = function(notification) {
  this.notifications.unshift({
    message: notification.message,
    type: notification.type || 'INFO',
    link: notification.link
  });
  
  // Keep only the latest 100 notifications
  if (this.notifications.length > 100) {
    this.notifications = this.notifications.slice(0, 100);
  }
  
  return this.save();
};

// Method to mark notifications as read
userSchema.methods.markNotificationsAsRead = function() {
  this.notifications = this.notifications.map(notification => ({
    ...notification,
    read: true
  }));
  
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;

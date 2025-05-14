const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all users
 * @route GET /api/users
 * @access Admin only
 */
const getAllUsers = async (req, res) => {
  try {
    console.log('Getting all users. Requester:', req.user?.username);
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view all users' });
    }
    
    // Get all users from the database
    const [users] = await pool.query(
      `SELECT id, username, email, student_id, first_name AS firstName, 
       last_name AS lastName, role, is_active AS isActive, 
       created_at AS createdAt, updated_at AS updatedAt 
       FROM users ORDER BY username`
    );
    
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Admin or self only
 */
const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    console.log(`Getting user with ID ${userId}. Requester:`, req.user?.username, 'Authorization header:', req.headers.authorization);
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    
    // Check if user is admin or self
    if (req.user?.role !== 'admin' && req.user?.id !== userId) {
      console.log(`Unauthorized access attempt. User ${req.user?.id} (${req.user?.username}) trying to access user ${userId}`);
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }
    
    // Get user from database
    console.log(`Executing database query for user ${userId}`);
    const [users] = await pool.query(
      `SELECT id, username, email, student_id, first_name AS firstName, 
       last_name AS lastName, role, is_active AS isActive, 
       created_at AS createdAt, updated_at AS updatedAt 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    console.log(`Query result for user ${userId}:`, users);
    
    if (users.length === 0) {
      console.log(`User with ID ${userId} not found in database`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`Sending user data for ID ${userId}:`, users[0]);
    return res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

/**
 * Update an existing user
 * @route PUT /api/users/:id
 * @access Admin or self only (with restrictions)
 */
const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    console.log(`Updating user with ID ${userId}. Requester:`, req.user?.username, 'Authorization header:', req.headers.authorization);
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    
    // Check if user is admin or self
    const isSelf = req.user?.id === userId;
    const isAdmin = req.user?.role === 'admin';
    
    if (!isAdmin && !isSelf) {
      console.log(`Unauthorized update attempt. User ${req.user?.id} (${req.user?.username}) trying to update user ${userId}`);
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    // Get current user data
    console.log(`Fetching current data for user ${userId}`);
    const [currentUsers] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (currentUsers.length === 0) {
      console.log(`User with ID ${userId} not found for update`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentUser = currentUsers[0];
    console.log(`Current user data:`, currentUser);
    
    // Prepare update data
    const { 
      email, 
      firstName, 
      lastName, 
      role, 
      isActive,
      student_id 
    } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const queryParams = [];
    
    if (email !== undefined) {
      updates.push('email = ?');
      queryParams.push(email);
    }
    
    if (firstName !== undefined) {
      updates.push('first_name = ?');
      queryParams.push(firstName);
    }
    
    if (lastName !== undefined) {
      updates.push('last_name = ?');
      queryParams.push(lastName);
    }
    
    // Only admins can update role and status
    if (isAdmin && role !== undefined) {
      updates.push('role = ?');
      queryParams.push(role);
    }
    
    if (isAdmin && isActive !== undefined) {
      updates.push('is_active = ?');
      queryParams.push(isActive ? 1 : 0);
    }
    
    if (student_id !== undefined) {
      updates.push('student_id = ?');
      queryParams.push(student_id);
    }
    
    // Add userId to query params
    queryParams.push(userId);
    
    // Execute update if there are fields to update
    if (updates.length > 0) {
      const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      console.log('Update query:', updateQuery);
      console.log('Update params:', queryParams);
      
      const result = await pool.query(updateQuery, queryParams);
      console.log('Update result:', result);
    } else {
      console.log('No fields to update');
    }
    
    // Get updated user
    console.log(`Fetching updated data for user ${userId}`);
    const [updatedUsers] = await pool.query(
      `SELECT id, username, email, student_id, first_name AS firstName, 
       last_name AS lastName, role, is_active AS isActive, 
       created_at AS createdAt, updated_at AS updatedAt 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (updatedUsers.length === 0) {
      console.log(`User ${userId} not found after update`);
      return res.status(404).json({ message: 'User not found after update' });
    }
    
    console.log('User updated successfully:', updatedUsers[0]);
    return res.json(updatedUsers[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

/**
 * Delete user (admin only)
 */
const deleteUser = async (req, res) => {
  // Stub function
  res.status(501).json({ message: 'Not implemented yet' });
};

/**
 * Toggle user status (admin only)
 */
const toggleUserStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to toggle user status' });
    }
    
    const userId = parseInt(req.params.id, 10);
    console.log(`Toggling status for user ${userId}. Requester:`, req.user?.username);
    
    // Get current user status
    const [currentUsers] = await pool.query(
      'SELECT id, is_active FROM users WHERE id = ?',
      [userId]
    );
    
    if (currentUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentUser = currentUsers[0];
    const newStatus = currentUser.is_active === 1 ? 0 : 1;
    
    // Toggle status
    console.log(`Changing user ${userId} status from ${currentUser.is_active} to ${newStatus}`);
    await pool.query(
      'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, userId]
    );
    
    // Get updated user
    const [updatedUsers] = await pool.query(
      `SELECT id, username, email, student_id, first_name AS firstName, 
       last_name AS lastName, role, is_active AS isActive, 
       created_at AS createdAt, updated_at AS updatedAt 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (updatedUsers.length === 0) {
      return res.status(404).json({ message: 'User not found after status update' });
    }
    
    console.log('User status toggled successfully:', updatedUsers[0]);
    return res.json(updatedUsers[0]);
  } catch (error) {
    console.error('Error toggling user status:', error);
    return res.status(500).json({ message: 'Error toggling user status', error: error.message });
  }
};

/**
 * Reset password (admin only)
 */
const resetPassword = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reset passwords' });
    }
    
    const userId = parseInt(req.params.id, 10);
    const { newPassword } = req.body;
    
    // Validate request
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    // Check if user exists
    const [users] = await pool.query(
      'SELECT id, username FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
    
    console.log(`Password reset for user ${users[0].username} (ID: ${userId}) by admin ${req.user.username}`);
    
    // Return success
    return res.json({ 
      message: 'Password has been reset successfully',
      userId: userId,
      username: users[0].username
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

/**
 * Bulk update users (admin only)
 */
const bulkUpdateUsers = async (req, res) => {
  // Stub function
  res.status(501).json({ message: 'Not implemented yet' });
};

/**
 * Get user audit logs (admin only)
 */
const getUserAuditLogs = async (req, res) => {
  // Stub function
  res.status(501).json({ message: 'Not implemented yet' });
};

/**
 * Create new user (admin only)
 */
const createUser = async (req, res) => {
  try {
    // Check if user is admin
    console.log('Creating new user. Requester:', req.user?.username);
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create users' });
    }
    
    // Get user data from request body
    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      role = 'user', 
      isActive = true,
      student_id 
    } = req.body;
    
    // Validate required fields
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }
    
    // Check if username or email already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    
    // Hash password if provided, or use a default
    const saltRounds = 10;
    const hashedPassword = password 
      ? await bcrypt.hash(password, saltRounds)
      : await bcrypt.hash('password123', saltRounds); // Default temporary password
    
    // Insert new user
    console.log('Inserting new user:', { username, email, firstName, lastName, role });
    
    const isActiveValue = isActive ? 1 : 0;
    
    const [result] = await pool.query(
      `INSERT INTO users 
        (username, email, password, first_name, last_name, role, is_active, student_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [username, email, hashedPassword, firstName, lastName, role, isActiveValue, student_id]
    );
    
    if (!result.insertId) {
      console.log('Failed to insert new user');
      return res.status(500).json({ message: 'Failed to create user' });
    }
    
    // Get the created user
    const [users] = await pool.query(
      `SELECT id, username, email, student_id, first_name AS firstName, 
       last_name AS lastName, role, is_active AS isActive, 
       created_at AS createdAt, updated_at AS updatedAt 
       FROM users WHERE id = ?`,
      [result.insertId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found after creation' });
    }
    
    console.log('User created successfully:', users[0]);
    return res.status(201).json(users[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExt}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create multer upload middleware
const uploadProfileImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter
}).single('profileImage');

/**
 * Get current user profile
 * @route GET /api/users/profile
 * @access Private
 */
const getProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user.id;
    
    // Get user from database
    const [users] = await pool.query(
      `SELECT id, username, email, student_id, first_name AS firstName, 
       last_name AS lastName, role, is_active AS isActive, profile_image AS profileImage,
       department, position, created_at AS createdAt, updated_at AS updatedAt 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data
    return res.json(users[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Error fetching profile' });
  }
};

/**
 * Update current user profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user.id;
    
    // Get data from request
    const { 
      firstName, 
      lastName, 
      email, 
      department, 
      position,
      phoneNumber,
      student_id
    } = req.body;
    
    console.log('Update profile request body:', req.body);
    
    // Validate required fields - only check if it's explicitly an empty string
    if (firstName === '' || firstName === null) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    // Validate email
    if (email !== undefined) {
      // Check if email already exists for another user
      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (existingUsers.length > 0) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }
    
    // Prepare update data
    const updates = [];
    const queryParams = [];
    
    if (email !== undefined && email !== null) {
      updates.push('email = ?');
      queryParams.push(email);
    }
    
    if (firstName !== undefined && firstName !== null) {
      updates.push('first_name = ?');
      queryParams.push(firstName);
    }
    
    if (lastName !== undefined) {
      updates.push('last_name = ?');
      queryParams.push(lastName || ''); // Handle null lastName
    }
    
    if (department !== undefined) {
      updates.push('department = ?');
      queryParams.push(department || null);
    }
    
    if (position !== undefined) {
      updates.push('position = ?');
      queryParams.push(position || null);
    }
    
    if (phoneNumber !== undefined) {
      updates.push('phone_number = ?');
      queryParams.push(phoneNumber || null);
    }
    
    if (student_id !== undefined) {
      updates.push('student_id = ?');
      queryParams.push(student_id || null);
    }
    
    // Add userId to query params
    queryParams.push(userId);
    
    // Execute update if there are fields to update
    if (updates.length > 0) {
      const updateQuery = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
      console.log('Executing update query:', updateQuery);
      console.log('Update parameters:', queryParams);
      await pool.query(updateQuery, queryParams);
      
      // Verify that the update happened
      const [updateResult] = await pool.query(
        'SELECT ROW_COUNT() as rowsAffected'
      );
      console.log('Update result:', updateResult);
    } else {
      console.log('No fields to update');
    }
    
    // Get updated user
    const [users] = await pool.query(
      `SELECT id, username, email, student_id, first_name AS firstName, 
       last_name AS lastName, role, is_active AS isActive, profile_image AS profileImage,
       department, position, phone_number AS phoneNumber, 
       created_at AS createdAt, updated_at AS updatedAt 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found after update' });
    }
    
    console.log('User profile updated successfully:', users[0]);
    
    // Return updated user
    return res.json(users[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

/**
 * Upload or update profile image
 * @route POST /api/users/profile/image
 * @access Private
 */
const uploadProfileImg = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const userId = req.user.id;
    const imageFile = req.file;
    
    console.log('Profile image upload request:', { userId, file: imageFile.filename });
    
    // Get user to check for previous profile image
    const [users] = await pool.query(
      'SELECT profile_image FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const oldImage = users[0].profile_image;
    console.log('Previous profile image:', oldImage);
    
    // Create absolute URL for the image
    const serverUrl = process.env.SERVER_URL || 'http://localhost:8000';
    // Update profile image in database - ensure path is consistent
    const imageUrl = `/uploads/profiles/${imageFile.filename}`;
    const absoluteImageUrl = `${serverUrl}${imageUrl}`;
    
    console.log('New image URL:', imageUrl);
    console.log('Absolute image URL:', absoluteImageUrl);
    
    // Debugging the image paths and directory
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    console.log('Upload directory:', uploadDir);
    console.log('Image file saved at:', path.join(uploadDir, imageFile.filename));
    
    // Update the database
    const [result] = await pool.query(
      'UPDATE users SET profile_image = ?, updated_at = NOW() WHERE id = ?',
      [imageUrl, userId]
    );
    
    console.log('Database update result:', result);
    
    // Delete old image if it exists
    if (oldImage) {
      try {
        const oldImagePath = path.join(__dirname, '../..', oldImage);
        console.log('Attempting to delete old image at:', oldImagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Old image deleted successfully');
        } else {
          console.log('Old image file not found');
        }
      } catch (err) {
        console.error('Error deleting old image:', err);
        // Continue processing even if old image deletion fails
      }
    }
    
    // Return success with both URLs
    return res.json({ 
      message: 'Profile image updated successfully',
      imageUrl,
      absoluteImageUrl
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
};

/**
 * Change password
 * @route POST /api/users/change-password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    console.log(`Password change attempt for user ID: ${userId}`);
    
    // Validate request
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    
    // Get user with password
    const [users] = await pool.query(
      'SELECT id, username, password FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Check current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      console.log(`Failed password change: Incorrect current password for user ${user.username}`);
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
    
    console.log(`Password changed successfully for user ${user.username}`);
    
    // Return success
    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkUpdateUsers,
  resetPassword,
  getUserAuditLogs,
  getProfile,
  updateProfile,
  uploadProfileImg,
  changePassword,
  uploadProfileImage
}; 
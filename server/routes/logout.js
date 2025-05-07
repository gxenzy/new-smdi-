const express = require('express');
const router = express.Router();
const { removeRefreshToken } = require('./refreshToken');

// @route   POST /api/auth/logout
// @desc    Logout user by clearing token and refresh token cookies
// @access  Private
router.post('/logout', (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    removeRefreshToken(refreshToken);
  }
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

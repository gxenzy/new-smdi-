const User = require('../models/UserSQL');

module.exports = {
  getAllUsers: async () => User.findAll({ order: [['createdAt', 'DESC']] }),
  getUserById: async (id) => User.findByPk(id),
  createUser: async (data) => User.create(data),
  updateUser: async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.update(data);
    return user;
  },
  deleteUser: async (id) => {
    const user = await User.findByPk(id);
    if (!user) return false;
    await user.destroy();
    return true;
  },
}; 
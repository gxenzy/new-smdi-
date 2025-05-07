const EnergyAudit = require('../models/EnergyAuditSQL');

module.exports = {
  getAllAudits: async () => EnergyAudit.findAll({ order: [['createdAt', 'DESC']] }),
  getAuditById: async (id) => EnergyAudit.findByPk(id),
  createAudit: async (data) => EnergyAudit.create(data),
  updateAudit: async (id, data) => {
    const audit = await EnergyAudit.findByPk(id);
    if (!audit) return null;
    await audit.update(data);
    return audit;
  },
  deleteAudit: async (id) => {
    const audit = await EnergyAudit.findByPk(id);
    if (!audit) return false;
    await audit.destroy();
    return true;
  },
}; 
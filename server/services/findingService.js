const Finding = require('../models/FindingSQL');

module.exports = {
  getAllFindings: async () => Finding.findAll({ order: [['createdAt', 'DESC']] }),
  getFindingById: async (id) => Finding.findByPk(id),
  getFindingsByAuditId: async (auditId) => Finding.findAll({ where: { auditId }, order: [['createdAt', 'DESC']] }),
  createFinding: async (data) => Finding.create(data),
  updateFinding: async (id, data) => {
    const finding = await Finding.findByPk(id);
    if (!finding) return null;
    await finding.update(data);
    return finding;
  },
  deleteFinding: async (id) => {
    const finding = await Finding.findByPk(id);
    if (!finding) return false;
    await finding.destroy();
    return true;
  },
}; 
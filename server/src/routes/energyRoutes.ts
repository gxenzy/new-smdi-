import express from 'express';

const router = express.Router();

/**
 * GET /api/energy/consumption
 * Get energy consumption data
 */
router.get('/consumption', (_req, res) => {
  // Sample energy consumption data
  const consumptionData = {
    daily: [
      { hour: '00:00', consumption: 42 },
      { hour: '04:00', consumption: 35 },
      { hour: '08:00', consumption: 85 },
      { hour: '12:00', consumption: 120 },
      { hour: '16:00', consumption: 95 },
      { hour: '20:00', consumption: 65 }
    ],
    monthly: [
      { month: 'Jan', consumption: 2450 },
      { month: 'Feb', consumption: 2200 },
      { month: 'Mar', consumption: 2300 },
      { month: 'Apr', consumption: 2100 },
      { month: 'May', consumption: 2550 },
      { month: 'Jun', consumption: 2800 }
    ]
  };
  
  res.json(consumptionData);
});

/**
 * GET /api/energy/distribution
 * Get energy distribution data by system type
 */
router.get('/distribution', (_req, res) => {
  // Sample energy distribution data
  const distributionData = {
    lighting: 35,
    hvac: 42,
    equipment: 15,
    other: 8
  };
  
  res.json(distributionData);
});

/**
 * GET /api/energy/metrics
 * Get energy metrics
 */
router.get('/metrics', (_req, res) => {
  // Sample energy metrics
  const metrics = {
    totalConsumption: 15000,
    eui: 12.5,
    averageDemand: 60,
    peakDemand: 95,
    costPerKwh: 9.75
  };
  
  res.json(metrics);
});

export default router; 
import { Request, Response } from 'express';
const EnergyAudit = require('../../models/EnergyAudit');

export const createEnergyAudit = async (req: Request, res: Response) => {
  try {
    const { title, description, status, startDate, endDate, location, findings, recommendations } = req.body;
    const createdBy = req.user?.id;
    if (!createdBy) {
      return res.status(400).json({ message: 'User not found in request' });
    }
    const newAudit = await EnergyAudit.create({
      title,
      description,
      status,
      startDate,
      endDate,
      location,
      findings,
      recommendations,
      createdBy
    });
    return res.status(201).json(newAudit);
  } catch (error) {
    console.error('Error creating energy audit:', error);
    return res.status(500).json({ message: 'Failed to create energy audit', error });
  }
}; 
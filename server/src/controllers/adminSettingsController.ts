import { Request, Response } from 'express';
import { pool } from '../config/database';

// Get all settings
export const getAllSettings = async (_req: Request, res: Response) => {
  try {
    const [settings] = await pool.query('SELECT * FROM admin_settings');
    return res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: 'Error fetching settings' });
  }
};

// Get a setting by key
export const getSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const [settings] = await pool.query('SELECT * FROM admin_settings WHERE setting_key = ?', [key]);
    if ((settings as any[]).length === 0) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    return res.json((settings as any[])[0]);
  } catch (error) {
    console.error('Error fetching setting:', error);
    return res.status(500).json({ message: 'Error fetching setting' });
  }
};

// Update or create a setting
export const upsertSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    await pool.query(
      'INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [key, value]
    );
    return res.json({ message: 'Setting updated' });
  } catch (error) {
    console.error('Error updating setting:', error);
    return res.status(500).json({ message: 'Error updating setting' });
  }
}; 
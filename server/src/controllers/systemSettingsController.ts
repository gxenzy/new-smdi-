import { Request, Response } from 'express';
import { pool } from '../config/database';
import { SystemSettings } from '../types';

/**
 * Get system settings
 * @route GET /api/admin/settings
 * @access Admin only
 */
export const getSystemSettings = async (_req: Request, res: Response) => {
  try {
    // Get settings from database
    const [settingsRows] = await pool.query('SELECT * FROM system_settings');
    
    if (!(settingsRows as any[]).length) {
      return res.status(404).json({ message: 'System settings not found' });
    }
    
    // Convert flat settings rows to structured object
    const settings: Record<string, any> = {};
    
    (settingsRows as any[]).forEach(row => {
      // Handle nested properties (with dot notation)
      if (row.setting_key.includes('.')) {
        const [parent, child] = row.setting_key.split('.');
        if (!settings[parent]) settings[parent] = {};
        
        // Handle boolean values
        if (row.setting_value === 'true') {
          settings[parent][child] = true;
        } else if (row.setting_value === 'false') {
          settings[parent][child] = false;
        } else if (!isNaN(Number(row.setting_value))) {
          settings[parent][child] = Number(row.setting_value);
        } else {
          settings[parent][child] = row.setting_value;
        }
      } else {
        // Handle boolean values
        if (row.setting_value === 'true') {
          settings[row.setting_key] = true;
        } else if (row.setting_value === 'false') {
          settings[row.setting_key] = false;
        } else if (!isNaN(Number(row.setting_value))) {
          settings[row.setting_key] = Number(row.setting_value);
        } else {
          settings[row.setting_key] = row.setting_value;
        }
      }
    });
    
    // Set default values for missing settings
    const systemSettings: SystemSettings = {
      siteName: settings.siteName || 'Energy Audit System',
      maxUsers: settings.maxUsers || 100,
      sessionTimeout: settings.sessionTimeout || 30,
      backupFrequency: settings.backupFrequency || 24,
      emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
      maintenanceMode: settings.maintenanceMode !== undefined ? settings.maintenanceMode : false,
      emergencyMode: settings.emergencyMode !== undefined ? settings.emergencyMode : false,
      debugMode: settings.debugMode !== undefined ? settings.debugMode : false,
      apiUrl: settings.apiUrl || 'http://localhost:8000',
      allowRegistration: settings.allowRegistration !== undefined ? settings.allowRegistration : false,
      registrationEnabled: settings.registrationEnabled !== undefined ? settings.registrationEnabled : false,
      theme: settings.theme || 'light',
      defaultRole: settings.defaultRole || 'viewer',
      passwordPolicy: {
        minLength: settings.passwordPolicy?.minLength || 8,
        requireSpecialChar: settings.passwordPolicy?.requireSpecialChar !== undefined 
          ? settings.passwordPolicy.requireSpecialChar 
          : true,
        requireNumber: settings.passwordPolicy?.requireNumber !== undefined 
          ? settings.passwordPolicy.requireNumber 
          : true,
        requireUppercase: settings.passwordPolicy?.requireUppercase !== undefined 
          ? settings.passwordPolicy.requireUppercase
          : true,
        requireLowercase: settings.passwordPolicy?.requireLowercase !== undefined
          ? settings.passwordPolicy.requireLowercase
          : true,
      },
      maxLoginAttempts: settings.maxLoginAttempts || 5,
    };
    
    return res.json(systemSettings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return res.status(500).json({ message: 'Error fetching system settings' });
  }
};

/**
 * Update system settings
 * @route PUT /api/admin/settings
 * @access Admin only
 */
export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const settings: Partial<SystemSettings> = req.body;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Prepare batch insert/update operations
      const operations = [];
      
      // Flat properties
      for (const [key, value] of Object.entries(settings)) {
        // Skip nested objects
        if (typeof value !== 'object' || value === null) {
          operations.push([key, value?.toString()]);
        }
      }
      
      // Handle password policy separately
      if (settings.passwordPolicy) {
        for (const [key, value] of Object.entries(settings.passwordPolicy)) {
          operations.push([`passwordPolicy.${key}`, value?.toString()]);
        }
      }
      
      // Execute batch operations
      if (operations.length > 0) {
        await Promise.all(operations.map(([key, value]) => 
          connection.query(
            'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
            [key, value]
          )
        ));
      }
      
      await connection.commit();
      
      // Return updated settings
      return res.json({ 
        message: 'Settings updated successfully',
        ...settings 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating system settings:', error);
    return res.status(500).json({ message: 'Error updating system settings' });
  }
}; 
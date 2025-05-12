import express from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

const router = express.Router();

// Data storage path
const DATA_DIR = path.join(__dirname, '../../uploads/floorplans');

// Ensure data directory exists
const ensureDataDirectory = async () => {
  try {
    await fsPromises.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
};

// Validation schemas
const AreaPointSchema = z.object({
  x: z.number(),
  y: z.number()
});

const RoomCoordsSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number()
});

const RoomDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  area: z.number(),
  roomType: z.string(),
  coords: RoomCoordsSchema,
  // Optional fields
  manualArea: z.number().optional(),
  reflectanceCeiling: z.number().optional(),
  reflectanceWalls: z.number().optional(),
  reflectanceFloor: z.number().optional(),
  maintenanceFactor: z.number().optional(),
  shape: z.enum(['rect', 'polygon']).optional(),
  points: z.array(AreaPointSchema).optional(),
  color: z.string().optional(),
  lightingLoad: z.number().optional(),
  requiredLux: z.number().optional(),
  recommendedFixtures: z.number().optional(),
  actualFixtures: z.number().optional(),
  compliance: z.number().optional(),
  notes: z.string().optional()
});

const NonCompliantAreaSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  type: z.enum(['lighting', 'power']),
  compliance: z.number(),
  title: z.string(),
  description: z.string(),
  isEditable: z.boolean().optional(),
  isDragging: z.boolean().optional()
});

const LoadItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  rating: z.number(),
  demandFactor: z.number(),
  connectedLoad: z.number(),
  demandLoad: z.number(),
  current: z.number(),
  voltAmpere: z.number(),
  circuitBreaker: z.string(),
  conductorSize: z.string()
});

const LoadScheduleSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  panelName: z.string(),
  items: z.array(LoadItemSchema).optional(),
  loads: z.array(LoadItemSchema).optional(),
  totalConnectedLoad: z.number(),
  totalDemandLoad: z.number(),
  voltage: z.number(),
  current: z.number(),
  powerFactor: z.number(),
  circuitBreaker: z.string().optional(),
  conductorSize: z.string().optional(),
  incomingFeederSize: z.string().optional(),
  feederProtectionSize: z.string().optional()
});

const FloorPlanDataSchema = z.object({
  rooms: z.array(RoomDetailSchema),
  nonCompliantAreas: z.array(NonCompliantAreaSchema),
  loadSchedules: z.array(LoadScheduleSchema)
});

// API Routes

/**
 * GET /api/floorplans/:floorKey
 * Get floor plan data for a specific floor
 */
router.get('/:floorKey', async (req, res) => {
  try {
    await ensureDataDirectory();
    
    const floorKey = req.params.floorKey;
    const filePath = path.join(DATA_DIR, `${floorKey}.json`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: `Floor plan data for '${floorKey}' not found`
      });
    }
    
    // Read file
    const fileData = await fsPromises.readFile(filePath, 'utf8');
    const data = JSON.parse(fileData);
    
    // Validate data format
    try {
      FloorPlanDataSchema.parse(data);
    } catch (validationError) {
      console.error('Data validation error:', validationError);
      return res.status(500).json({
        success: false,
        message: 'Stored data has invalid format'
      });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error retrieving floor plan data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve floor plan data'
    });
  }
});

/**
 * POST /api/floorplans/:floorKey
 * Save floor plan data for a specific floor
 */
router.post('/:floorKey', async (req, res) => {
  try {
    await ensureDataDirectory();
    
    const floorKey = req.params.floorKey;
    const filePath = path.join(DATA_DIR, `${floorKey}.json`);
    
    // Validate incoming data
    try {
      FloorPlanDataSchema.parse(req.body);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({
        success: false,
        message: 'Invalid floor plan data format',
        details: validationError
      });
    }
    
    // Save data to file
    await fsPromises.writeFile(
      filePath,
      JSON.stringify(req.body, null, 2),
      'utf8'
    );
    
    return res.json({
      success: true,
      message: `Floor plan data for '${floorKey}' saved successfully`
    });
  } catch (error) {
    console.error('Error saving floor plan data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save floor plan data'
    });
  }
});

/**
 * GET /api/floorplans/building
 * Get summary of all floors in the building
 */
router.get('/building/summary', async (_req, res) => {
  try {
    await ensureDataDirectory();
    
    // Read all floor plan files
    const files = await fsPromises.readdir(DATA_DIR);
    const floorFiles = files.filter(file => file.endsWith('.json'));
    
    // Create building summary with proper typing for floors
    const buildingData: {
      name: string;
      floors: {
        [key: string]: {
          name: string;
          rooms: number;
          loadSchedules: number;
        }
      }
    } = {
      name: 'Energy Audit Building',
      floors: {}
    };
    
    // Process each floor file
    for (const file of floorFiles) {
      const floorKey = path.basename(file, '.json');
      const filePath = path.join(DATA_DIR, file);
      
      // Read floor data
      const fileData = await fsPromises.readFile(filePath, 'utf8');
      const floorData = JSON.parse(fileData);
      
      // Extract summary information
      buildingData.floors[floorKey] = {
        name: floorKey.charAt(0).toUpperCase() + floorKey.slice(1) + ' Floor',
        rooms: floorData.rooms.length,
        loadSchedules: floorData.loadSchedules.length
      };
    }
    
    return res.json(buildingData);
  } catch (error) {
    console.error('Error retrieving building data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve building data'
    });
  }
});

export default router; 
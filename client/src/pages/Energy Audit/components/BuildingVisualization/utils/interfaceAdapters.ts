/**
 * Adapter utilities for converting between different interface versions
 * This resolves type compatibility issues between different modules
 */

import type {
  RoomDetail,
  DetectedRoom,
  BuildingData
} from '../interfaces';

// Define the FloorData interface here
interface FloorData {
  name: string;
  rooms: RoomDetail[];
  loadSchedules: any[];
}

// Define the Point interface here
interface Point {
  x: number;
  y: number;
}

/**
 * Convert any RoomDetail-like object to the standardized RoomDetail interface.
 * This ensures type compatibility across different parts of the application.
 */
export function adaptToRoomDetail(room: any): RoomDetail {
  // Ensure all required properties are present with defaults
  return {
    id: room.id || `room-${Date.now()}`,
    name: room.name || 'Unnamed Room',
    area: room.area || 0,
    width: room.width || 0,
    height: room.height || 0,
    length: room.length || 0,
    roomType: room.roomType || room.type || 'unknown',
    coords: room.coords || { x: 0, y: 0, width: 0, height: 0 },
    requiredLux: room.requiredLux || 500, // Default value
    reflectanceCeiling: room.reflectanceCeiling || 0.7, // Default value
    reflectanceWalls: room.reflectanceWalls || 0.5, // Default value
    reflectanceFloor: room.reflectanceFloor || 0.2, // Default value
    maintenanceFactor: room.maintenanceFactor || 0.8, // Default value
    // All other properties are optional
    ...(room.floor !== undefined && { floor: room.floor }),
    ...(room.position !== undefined && { position: room.position }),
    ...(room.occupancy !== undefined && { occupancy: room.occupancy }),
    ...(room.lighting !== undefined && { lighting: room.lighting }),
    ...(room.equipment !== undefined && { equipment: room.equipment }),
    ...(room.hvac !== undefined && { hvac: room.hvac }),
    ...(room.hasAnomalies !== undefined && { hasAnomalies: room.hasAnomalies }),
    ...(room.annotations !== undefined && { annotations: room.annotations }),
    ...(room.color !== undefined && { color: room.color }),
    ...(room.borderColor !== undefined && { borderColor: room.borderColor }),
    ...(room.currentLux !== undefined && { currentLux: room.currentLux }),
    ...(room.notes !== undefined && { notes: room.notes }),
    ...(room.audit !== undefined && { audit: room.audit }),
    ...(room.recommendedFixtures !== undefined && { recommendedFixtures: room.recommendedFixtures }),
    ...(room.actualFixtures !== undefined && { actualFixtures: room.actualFixtures }),
    ...(room.compliance !== undefined && { compliance: room.compliance }),
    ...(room.shape !== undefined && { 
      shape: (room.shape === 'rect' || room.shape === 'polygon') ? room.shape : 'rect' 
    }),
    ...(room.points !== undefined && { points: room.points }),
    ...(room.energyUsage !== undefined && { energyUsage: room.energyUsage }),
    ...(room.powerDetails !== undefined && { powerDetails: room.powerDetails }),
  } as RoomDetail;  // Use type assertion to avoid TypeScript errors
}

/**
 * Convert any DetectedRoom-like object to the standardized DetectedRoom interface.
 */
export function adaptToDetectedRoom(room: any): DetectedRoom {
  return {
    id: room.id || `detected-${Date.now()}`,
    name: room.name || 'Detected Room',
    type: room.type || 'unknown',
    x: room.x || 0,
    y: room.y || 0,
    width: room.width || 0,
    height: room.height || 0,
    confidence: room.confidence || 0.5,
    ...(room.polygon !== undefined && { polygon: room.polygon }),
  };
}

/**
 * Convert an array of any type of room to standardized RoomDetail array
 */
export function adaptRoomsArray(rooms: any[]): RoomDetail[] {
  return rooms.map(adaptToRoomDetail);
}

/**
 * Convert an array of any type of detected room to standardized DetectedRoom array
 */
export function adaptDetectedRoomsArray(rooms: any[]): DetectedRoom[] {
  return rooms.map(adaptToDetectedRoom);
}

/**
 * Convert any building data format to the standardized BuildingData interface
 */
export function adaptToBuildingData(data: any): BuildingData {
  const result: BuildingData = {
    name: data.name || 'Building',
    floors: {},
  };
  
  // Convert floors
  if (data.floors) {
    Object.keys(data.floors).forEach(key => {
      const floor = data.floors[key];
      result.floors[key] = {
        name: floor.name || `Floor ${key}`,
        rooms: adaptRoomsArray(floor.rooms || []),
        loadSchedules: floor.loadSchedules || [],
      };
    });
  }
  
  return result;
} 
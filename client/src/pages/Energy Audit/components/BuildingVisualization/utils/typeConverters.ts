import { RoomDetail, DetectedRoom } from '../interfaces';

/**
 * Converts a RoomDetail to a DetectedRoom for use in detection systems
 */
export const roomDetailToDetectedRoom = (room: RoomDetail): DetectedRoom => {
  return {
    id: room.id,
    name: room.name,
    x: room.coords.x,
    y: room.coords.y,
    width: room.coords.width,
    height: room.coords.height,
    confidence: 1.0, // Default high confidence since this is a manual conversion
    type: room.roomType
  };
};

/**
 * Converts a DetectedRoom to a RoomDetail with default values
 */
export const detectedRoomToRoomDetail = (room: DetectedRoom): RoomDetail => {
  // Calculate dimensions in meters from pixels
  // Assuming 50px = 1m (approximate)
  const length = room.width / 50; 
  const width = room.height / 50;
  const area = length * width;
  
  // Get default lux requirement based on room type
  const luxRequirements: Record<string, number> = {
    'office': 500,
    'conference': 400,
    'restroom': 150,
    'kitchen': 500,
    'storage': 150,
    'electrical': 300,
    'hallway': 150,
    'stairs': 200,
    'reception': 300,
    'lobby': 200,
    'classroom': 500,
    'laboratory': 500,
    'server': 400,
    'default': 300
  };
  
  const requiredLux = luxRequirements[room.type] || 300;
  const recommendedFixtures = Math.ceil(area * requiredLux / 5000);
  
  return {
    id: room.id,
    name: room.name,
    length,
    width,
    height: 3, // Standard ceiling height
    area,
    roomType: room.type,
    coords: {
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height
    },
    shape: 'rect', // Default to rectangle
    reflectanceCeiling: 0.7, // Default values
    reflectanceWalls: 0.5,
    reflectanceFloor: 0.2,
    maintenanceFactor: 0.8,
    requiredLux,
    recommendedFixtures,
    actualFixtures: recommendedFixtures,
    compliance: 100 // Default compliance
  };
}; 
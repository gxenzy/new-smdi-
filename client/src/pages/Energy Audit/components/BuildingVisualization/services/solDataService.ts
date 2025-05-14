import { LoadSchedule, LoadItem, RoomDetail } from '../interfaces';

/**
 * SOL (Schedule of Loads) Data Service
 * Provides methods to load, parse and integrate electrical load data with room visualization
 */

// Interface for full SOL data structure
export interface SOLData {
  floors: Record<string, FloorSOLData>;
  buildingTotal: BuildingTotals;
  metadata: SOLMetadata;
}

// Interface for floor-level SOL data
export interface FloorSOLData {
  rooms: Record<string, SOLRoomData>;
  floorTotal: {
    totalConnectedLoad: number;
    totalDemandLoad: number;
  };
}

// Interface for room-level SOL data
export interface SOLRoomData {
  roomId: string;
  panelName: string;
  loads: LoadItem[];
  totalConnectedLoad: number;
  totalDemandLoad: number;
}

// Interface for building totals
export interface BuildingTotals {
  totalConnectedLoad: number;
  totalDemandLoad: number;
  mainBreaker: string;
}

// Interface for metadata
export interface SOLMetadata {
  version: string;
  date: string;
  author: string;
}

// Create a simpler SOL data structure that matches our interfaces
export const SOL_DATA: SOLData = {
  floors: {
    'ground': {
      rooms: {
        'room-g1': {
          roomId: 'room-g1',
          panelName: "Main Office Panel",
          loads: [
            { 
              description: "LED Lamps", 
              quantity: 10, 
              rating: 18, 
              demandFactor: 1.0, 
              connectedLoad: 180, 
              demandLoad: 180,
              current: 0.82,
              voltAmpere: 180,
              circuitBreaker: "15A",
              conductorSize: "2.0mm²"
            } as LoadItem,
            { 
              description: "Convenience Outlets", 
              quantity: 8, 
              rating: 180, 
              demandFactor: 0.8, 
              connectedLoad: 1440, 
              demandLoad: 1152,
              current: 5.2,
              voltAmpere: 1440,
              circuitBreaker: "20A",
              conductorSize: "3.5mm²"
            } as LoadItem,
            { 
              description: "Computer Outlets", 
              quantity: 6, 
              rating: 250, 
              demandFactor: 0.9, 
              connectedLoad: 1500, 
              demandLoad: 1350,
              current: 6.1,
              voltAmpere: 1500,
              circuitBreaker: "20A",
              conductorSize: "3.5mm²"
            } as LoadItem
          ],
          totalConnectedLoad: 3120,
          totalDemandLoad: 2682
        }
      },
      floorTotal: {
        totalConnectedLoad: 3120,
        totalDemandLoad: 2682
      }
    }
  },
  buildingTotal: {
    totalConnectedLoad: 3120,
    totalDemandLoad: 2682,
    mainBreaker: "100A"
  },
  metadata: {
    version: "1.0",
    date: new Date().toISOString(),
    author: "Energy Audit System"
  }
};

/**
 * SOL Data Service
 * Provides functionality to work with Schedule of Loads data
 */
export class SolDataService {
  // Get SOL data for the whole building
  getSolData(): SOLData {
    return SOL_DATA;
  }
  
  // Get SOL data for a specific floor
  getFloorData(floorId: string): FloorSOLData | null {
    return SOL_DATA.floors[floorId] || null;
  }
  
  // Get SOL data for a specific room
  getRoomData(floorId: string, roomId: string): SOLRoomData | null {
    return SOL_DATA.floors[floorId]?.rooms[roomId] || null;
  }
  
  // Get SOL data for a floor with schedules format (for compatibility with cnnDetection)
  getFloorSOLData(floorId: string): { schedules: { roomId: string; panelName: string }[] } | null {
    const floorData = this.getFloorData(floorId);
    if (!floorData) return null;
    
    // Convert room data to schedules format
    const schedules = Object.values(floorData.rooms).map(roomData => ({
      roomId: roomData.roomId,
      panelName: roomData.panelName
    }));
    
    return { schedules };
  }
  
  // Calculate total power consumption for a room
  calculateRoomPower(floorId: string, roomId: string): { connectedLoad: number; demandLoad: number } {
    const roomData = this.getRoomData(floorId, roomId);
    if (!roomData) {
      return { connectedLoad: 0, demandLoad: 0 };
    }
    return { 
      connectedLoad: roomData.totalConnectedLoad,
      demandLoad: roomData.totalDemandLoad
    };
  }
  
  // Integration function to associate SOL data with room visualization data
  integrateWithRoomData(rooms: RoomDetail[], floorId: string): RoomDetail[] {
    return rooms.map(room => {
      const solData = this.getRoomData(floorId, room.id);
      
      if (solData) {
        return {
          ...room,
          powerDetails: {
            connectedLoad: solData.totalConnectedLoad,
            demandLoad: solData.totalDemandLoad,
            voltage: 220, // Default voltage
            current: solData.totalDemandLoad / 220, // I = P/V
            powerFactor: 0.85 // Default power factor
          }
        };
      }
      
      return room;
    });
  }
  
  // Enrich rooms with SOL data
  enrichRoomsWithSOLData(rooms: RoomDetail[], floorId: string): RoomDetail[] {
    return rooms.map(room => {
      const solData = this.getRoomData(floorId, room.id);
      
      if (solData) {
        return {
          ...room,
          powerDetails: {
            connectedLoad: solData.totalConnectedLoad,
            demandLoad: solData.totalDemandLoad,
            voltage: 220, // Default voltage
            current: solData.totalDemandLoad / 220, // I = P/V
            powerFactor: 0.85 // Default power factor
          }
        };
      }
      
      return room;
    });
  }
}

// Export a singleton instance
export const solDataService = new SolDataService();
export default solDataService; 
import { RoomDetail, NonCompliantArea, LoadSchedule, BuildingData } from '../interfaces';

/**
 * Service for handling floorplan data operations
 */
const floorPlanService = {
  /**
   * Load floor plan data for a specific floor
   * @param floorKey Floor identifier
   * @returns Floor plan data
   */
  async loadFloorPlanData(floorKey: string): Promise<{
    rooms: RoomDetail[];
    nonCompliantAreas: NonCompliantArea[];
    loadSchedules: LoadSchedule[];
  }> {
    try {
      // Try to fetch from API
      const response = await fetch(`/api/floorplans/${floorKey}`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      // If API fails, try to load from localStorage
      const localData = localStorage.getItem(`floorplan_${floorKey}`);
      
      if (localData) {
        return JSON.parse(localData);
      }
      
      // Return empty data if nothing found
      return {
        rooms: [],
        nonCompliantAreas: [],
        loadSchedules: []
      };
    } catch (error) {
      console.error(`Error loading floor plan data for ${floorKey}:`, error);
      
      // Try to load from localStorage as fallback
      const localData = localStorage.getItem(`floorplan_${floorKey}`);
      
      if (localData) {
        return JSON.parse(localData);
      }
      
      // Return empty data if nothing found
      return {
        rooms: [],
        nonCompliantAreas: [],
        loadSchedules: []
      };
    }
  },
  
  /**
   * Save floor plan data for a specific floor
   * @param floorKey Floor identifier
   * @param rooms Room data
   * @param nonCompliantAreas Non-compliant area data
   * @param loadSchedules Load schedule data
   */
  async saveFloorPlanData(
    floorKey: string, 
    rooms: RoomDetail[], 
    nonCompliantAreas: NonCompliantArea[],
    loadSchedules: LoadSchedule[]
  ): Promise<void> {
    const data = {
      rooms,
      nonCompliantAreas,
      loadSchedules
    };
    
    // Save to localStorage as a backup
    localStorage.setItem(`floorplan_${floorKey}`, JSON.stringify(data));
    
    try {
      // Save to API
      const response = await fetch(`/api/floorplans/${floorKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save floor plan data: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error saving floor plan data for ${floorKey}:`, error);
      // Save was already done to localStorage, so we don't need additional fallback
    }
  },
  
  /**
   * Export floor plan data to a downloadable file
   * @param buildingName Name of building for the filename
   * @param data Floor data to export
   */
  exportFloorPlanData(buildingName: string, data: any): void {
    // Format building name for filename
    const safeFileName = buildingName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Create a Blob with the data
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFileName}_floorplan_${data.floor}_${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
  
  /**
   * Import floor plan data from a file
   * @param file JSON file to import
   * @returns Parsed floor plan data
   */
  async importFloorPlanData(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (!event.target?.result) {
            throw new Error('Failed to read file');
          }
          
          const data = JSON.parse(event.target.result as string);
          
          // Basic validation
          if (!data.rooms || !Array.isArray(data.rooms)) {
            throw new Error('Invalid floor plan data format: missing rooms array');
          }
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  },
  
  /**
   * Get building summary data
   * @returns Building summary data
   */
  async getBuildingSummary(): Promise<BuildingData> {
    try {
      const response = await fetch('/api/floorplans/building/summary');
      
      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to load building summary');
    } catch (error) {
      console.error('Error loading building summary:', error);
      
      // Return minimal building data
      return {
        name: 'Energy Audit Building',
        floors: {}
      };
    }
  }
};

export default floorPlanService; 
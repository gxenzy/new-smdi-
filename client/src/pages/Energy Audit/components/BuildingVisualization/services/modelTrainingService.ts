/**
 * Model Training Service
 * Handles training data collection, model training, and evaluation
 */

import { DetectedRoom, RoomDetail } from '../interfaces';
import { getItem, setItem } from '../../../../../utils/storageUtils';
import { neuralDetection } from '../utils/neuralDetection';

// Constants
const TRAINING_DATA_KEY = 'room-detection-training-data';
const TRAINING_STATS_KEY = 'room-detection-training-stats';
const MAX_SAMPLES_PER_FLOOR = 10;

/**
 * Training data sample structure
 */
interface TrainingSample {
  timestamp: number;
  floorId: string;
  imageUrl: string;
  detectedRooms: DetectedRoom[];
  manualCorrections: boolean;
  confidence: number;
}

/**
 * Training statistics
 */
interface TrainingStats {
  totalSamples: number;
  lastTrainingDate: number;
  accuracyHistory: {
    date: number;
    accuracy: number;
  }[];
  floorCoverage: Record<string, number>;
}

/**
 * Model Training Service
 * Manages the collection of training data and model training process
 */
class ModelTrainingService {
  private trainingData: TrainingSample[] = [];
  private stats: TrainingStats = {
    totalSamples: 0,
    lastTrainingDate: 0,
    accuracyHistory: [],
    floorCoverage: {}
  };
  
  constructor() {
    // Load existing training data and stats
    this.loadTrainingData();
    this.loadStats();
  }
  
  /**
   * Load training data from storage
   */
  private loadTrainingData(): void {
    const storedData = getItem<TrainingSample[]>(TRAINING_DATA_KEY, []);
    this.trainingData = storedData || [];
  }
  
  /**
   * Load training statistics from storage
   */
  private loadStats(): void {
    const storedStats = getItem<TrainingStats>(TRAINING_STATS_KEY, null);
    
    if (storedStats) {
      this.stats = storedStats;
    } else {
      // Initialize default stats
      this.stats = {
        totalSamples: 0,
        lastTrainingDate: 0,
        accuracyHistory: [],
        floorCoverage: {}
      };
    }
  }
  
  /**
   * Save training data to storage
   */
  private saveTrainingData(): void {
    setItem(TRAINING_DATA_KEY, this.trainingData);
  }
  
  /**
   * Save training statistics to storage
   */
  private saveStats(): void {
    setItem(TRAINING_STATS_KEY, this.stats);
  }
  
  /**
   * Add a new training sample
   * @param floorId Floor identifier
   * @param imageUrl URL of the floor plan image
   * @param detectedRooms Detected rooms (after any manual corrections)
   * @param manualCorrections Whether manual corrections were applied
   * @param confidence Detection confidence
   * @returns True if sample was added successfully
   */
  public addTrainingSample(
    floorId: string,
    imageUrl: string,
    detectedRooms: DetectedRoom[],
    manualCorrections: boolean,
    confidence: number
  ): boolean {
    try {
      // Only add high-quality samples
      if (confidence < 0.6 && !manualCorrections) {
        console.log('Sample quality too low for training');
        return false;
      }
      
      // Create new sample
      const sample: TrainingSample = {
        timestamp: Date.now(),
        floorId,
        imageUrl,
        detectedRooms,
        manualCorrections,
        confidence
      };
      
      // Add to training data
      this.trainingData.push(sample);
      
      // Limit samples per floor
      const floorSamples = this.trainingData.filter(s => s.floorId === floorId);
      if (floorSamples.length > MAX_SAMPLES_PER_FLOOR) {
        // Remove oldest samples
        const samplesToRemove = floorSamples.length - MAX_SAMPLES_PER_FLOOR;
        
        // Sort by timestamp (ascending)
        const sortedSamples = [...floorSamples].sort((a, b) => a.timestamp - b.timestamp);
        
        // Get IDs of oldest samples
        const oldestSampleTimestamps = sortedSamples
          .slice(0, samplesToRemove)
          .map(s => s.timestamp);
        
        // Remove oldest samples
        this.trainingData = this.trainingData.filter(
          s => s.floorId !== floorId || !oldestSampleTimestamps.includes(s.timestamp)
        );
      }
      
      // Update stats
      this.stats.totalSamples++;
      this.stats.floorCoverage[floorId] = (this.stats.floorCoverage[floorId] || 0) + 1;
      
      // Save changes
      this.saveTrainingData();
      this.saveStats();
      
      return true;
    } catch (error) {
      console.error('Error adding training sample:', error);
      return false;
    }
  }
  
  /**
   * Train the model with all collected training data
   * @returns Promise resolving to training success status
   */
  public async trainModel(): Promise<boolean> {
    if (this.trainingData.length === 0) {
      console.log('No training data available');
      return false;
    }
    
    try {
      console.log(`Training model with ${this.trainingData.length} samples`);
      
      // Sort samples by timestamp (newest first)
      const sortedSamples = [...this.trainingData].sort((a, b) => b.timestamp - a.timestamp);
      
      // Process each sample
      let successCount = 0;
      
      for (const sample of sortedSamples) {
        try {
          // Load image
          const img = await this.loadImage(sample.imageUrl);
          
          // Train on sample
          const success = await neuralDetection.trainOnSample(img, sample.detectedRooms);
          
          if (success) {
            successCount++;
          }
        } catch (error) {
          console.error('Error processing training sample:', error);
        }
      }
      
      // Update stats
      this.stats.lastTrainingDate = Date.now();
      this.stats.accuracyHistory.push({
        date: Date.now(),
        accuracy: successCount / sortedSamples.length
      });
      
      // Keep only the last 10 accuracy records
      if (this.stats.accuracyHistory.length > 10) {
        this.stats.accuracyHistory = this.stats.accuracyHistory.slice(-10);
      }
      
      this.saveStats();
      
      console.log(`Model training completed. ${successCount}/${sortedSamples.length} samples processed successfully`);
      return successCount > 0;
    } catch (error) {
      console.error('Error training model:', error);
      return false;
    }
  }
  
  /**
   * Get training statistics
   * @returns Current training statistics
   */
  public getTrainingStats(): TrainingStats {
    return { ...this.stats };
  }
  
  /**
   * Clear all training data
   */
  public clearTrainingData(): void {
    this.trainingData = [];
    this.saveTrainingData();
    
    // Reset stats
    this.stats.totalSamples = 0;
    this.stats.floorCoverage = {};
    this.saveStats();
  }
  
  /**
   * Helper function to load an image
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}

// Export singleton instance
export const modelTrainingService = new ModelTrainingService(); 
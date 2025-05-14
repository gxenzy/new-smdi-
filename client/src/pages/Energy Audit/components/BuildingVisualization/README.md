# Building Visualization Room Detection System

## System Overview

The Building Visualization module uses a hybrid approach for room detection that combines neural networks with traditional computer vision techniques:

![Room Detection Architecture](https://i.imgur.com/WQ6E4Xm.png)

## Component Architecture

### 1. Detection Pipeline

The room detection system follows this workflow:

1. **Neural Detection** (`neuralDetection.ts`)
   - Attempts to detect rooms using deep learning
   - Uses TensorFlow.js for client-side neural network inference
   - Falls back to traditional detection if unavailable or unsuccessful

2. **Adaptive Learning** (`cnnDetection.ts`)
   - Traditional computer vision approach using contour detection
   - Enhanced with pattern recognition that improves over time
   - Stores successful detection patterns to improve future detections

3. **Model Training** (`modelTrainingService.ts`)
   - Collects training samples from user-verified room data
   - Manages incremental training of the neural model
   - Tracks training statistics and model performance

### 2. How Neural Detection Works

The neural network component uses semantic segmentation to identify rooms in floor plans:

- Loads a pre-trained TensorFlow.js model from server or IndexedDB cache
- Processes floor plan images to generate room masks
- Converts masks to room coordinates with metadata
- Improves through incremental training when users verify room detections

### 3. How Adaptive Learning Works

The adaptive learning system provides a reliable fallback and learns from experience:

- Uses OpenCV-inspired contour detection to find room boundaries
- Removes text and noise using connected component analysis
- Maintains a database of successful detection patterns
- Applies critical thinking to detect missing rooms
- Performs statistical analysis to identify reliable patterns

## Integration

The two systems are integrated as follows:

1. The `detectRoomsWithNeuralNetwork()` function in neuralDetection.ts is the main entry point
2. It attempts neural detection first, falling back to traditional methods if needed
3. User feedback is used to train both systems
4. Both adaptive learning and neural network improve over time

## Benefits of Hybrid Approach

1. **Resiliency**: Even if TensorFlow.js fails to load or run, the system still works
2. **Continuous Improvement**: Both systems learn from user corrections
3. **Speed**: Traditional methods provide fast results while neural processing occurs
4. **Accuracy**: Combines the strengths of both approaches for optimal results 
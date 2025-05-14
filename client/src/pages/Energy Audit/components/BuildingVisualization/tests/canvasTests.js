/**
 * Simple canvas testing utility to validate our fixes for the canvas errors
 * This can be executed in the browser console to check for issues
 */

const testCanvasOperations = () => {
  console.log('Running canvas tests...');
  
  try {
    // Test 1: Create and verify basic canvas operations
    console.log('Test 1: Creating canvas...');
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Test failed: Could not get canvas context');
      return false;
    }
    
    console.log('Test 1 passed: Canvas context obtained');
    
    // Test 2: Draw on canvas
    console.log('Test 2: Drawing on canvas...');
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, 100, 100);
    
    // Verify something was drawn
    const imageData = ctx.getImageData(50, 50, 1, 1);
    if (imageData.data[2] !== 255) { // Check blue component
      console.error('Test 2 failed: Drawing operation did not work');
      return false;
    }
    console.log('Test 2 passed: Drawing operation successful');
    
    // Test 3: drawImage operation (canvas to canvas)
    console.log('Test 3: Testing drawImage from canvas to canvas...');
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = 50;
    sourceCanvas.height = 50;
    const sourceCtx = sourceCanvas.getContext('2d');
    if (!sourceCtx) {
      console.error('Test 3 failed: Could not get source canvas context');
      return false;
    }
    
    sourceCtx.fillStyle = 'red';
    sourceCtx.fillRect(0, 0, 50, 50);
    
    try {
      ctx.drawImage(sourceCanvas, 100, 0);
      console.log('Test 3 passed: Canvas-to-canvas drawImage successful');
    } catch (e) {
      console.error('Test 3 failed: Canvas-to-canvas drawImage failed', e);
      return false;
    }
    
    // Test 4: Image loading
    console.log('Test 4: Testing image loading...');
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log('Test 4: Image loaded with dimensions', img.width, 'x', img.height);
        
        try {
          ctx.drawImage(img, 0, 100);
          console.log('Test 4 passed: Image drawImage successful');
          resolve(true);
        } catch (e) {
          console.error('Test 4 failed: Image drawImage failed', e);
          resolve(false);
        }
      };
      
      img.onerror = (e) => {
        console.error('Test 4 failed: Image loading failed', e);
        resolve(false);
      };
      
      // Use a placeholder image that should always be available
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJ5gZ7OaAAAAABJRU5ErkJggg==';
    });
  } catch (e) {
    console.error('Test failed with exception:', e);
    return false;
  }
};

// Function to run from console
window.runCanvasTests = () => {
  const result = testCanvasOperations();
  if (result instanceof Promise) {
    result.then(success => {
      console.log('All canvas tests complete:', success ? 'PASSED' : 'FAILED');
    });
  } else {
    console.log('All canvas tests complete:', result ? 'PASSED' : 'FAILED');
  }
};

// Export for module usage
export { testCanvasOperations };

console.log('Canvas tests loaded - run window.runCanvasTests() to execute tests'); 
console.log("Starting test script");

// Basic console.log test
console.log("Testing console.log output");
console.error("Testing console.error output");

// Make sure we're seeing what the process args are
console.log("Process arguments:", process.argv);

// Also test setTimeout to see if there's an event loop issue
setTimeout(() => {
  console.log("This should appear after 1 second");
  console.log("Test completed");
}, 1000);

console.log("Test script main portion executed"); 
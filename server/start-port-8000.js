/**
 * Server starter script that forces port 8000
 * This script overrides the PORT environment variable to ensure the server runs on port 8000
 * Run with: node start-port-8000.js
 */

// Force port 8000
process.env.PORT = 8000;

// Load the server
require('./src/index.js'); 
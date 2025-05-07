import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test file
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

// Set test environment variables if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '5001';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_USER = process.env.DB_USER || 'smdi';
process.env.DB_PASS = process.env.DB_PASS || 'SMD1SQLADM1N';
process.env.DB_NAME = process.env.DB_NAME || 'energyauditdb';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Increase timeout for tests
jest.setTimeout(30000); 
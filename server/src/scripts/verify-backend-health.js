const axios = require('axios');
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
const dbConfig = require('../config/db');

const API_BASE = 'http://localhost:8000/api';
const HEALTH_URL = 'http://localhost:8000/health';
const endpoints = [
  '/energy-audit',
  '/standards-api',
  '/compliance',
];
const requiredTables = [
  'energy_audits',
  'standards',
  'compliance_rules',
  'compliance_checklists',
  'compliance_checks',
];

async function checkHealth() {
  try {
    const res = await axios.get(HEALTH_URL);
    logger.info(`Health check: ${res.status} ${JSON.stringify(res.data)}`);
  } catch (err) {
    logger.error('Health check failed:', err.message);
  }
}

async function checkEndpoints() {
  for (const ep of endpoints) {
    try {
      const res = await axios.get(API_BASE + ep);
      logger.info(`Endpoint ${ep}: ${res.status} OK`);
    } catch (err) {
      if (err.response) {
        logger.error(`Endpoint ${ep}: ${err.response.status} ${err.response.statusText}`);
      } else {
        logger.error(`Endpoint ${ep}: ${err.message}`);
      }
    }
  }
}

async function checkTables() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    logger.info('Database connection successful');
    
    for (const table of requiredTables) {
      try {
        const query = `SHOW TABLES LIKE '${table}'`;
        const [rows] = await connection.execute(query);
        
        if (rows.length > 0) {
          logger.info(`Table exists: ${table}`);
        } else {
          logger.error(`Table missing: ${table}`);
        }
      } catch (err) {
        logger.error(`Error checking table ${table}: ${err.message}`);
      }
    }
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
  } finally {
    if (connection) await connection.end();
  }
}

(async () => {
  logger.info('--- Backend Health Check ---');
  await checkHealth();
  logger.info('--- API Endpoints Check ---');
  await checkEndpoints();
  logger.info('--- Database Tables Check ---');
  await checkTables();
  logger.info('--- Check Complete ---');
})(); 
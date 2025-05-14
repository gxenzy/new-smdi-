/**
 * Unified Compliance Management Script
 * 
 * A single script to manage all compliance-related operations:
 * - Check rules
 * - Check checklists
 * - Generate mock rules
 * - Generate mock checklists
 * - Run migrations
 * 
 * Usage:
 *   node compliance-manager.js <command>
 * 
 * Commands:
 *   check-rules         - Check compliance rules in the database
 *   check-checklists    - Check compliance checklists in the database
 *   generate-rules      - Generate mock compliance rules
 *   generate-checklists - Generate mock compliance checklists
 *   migrate             - Run all compliance-related migrations
 *   migrate-down        - Roll back compliance-related migrations
 *   setup-all           - Run all migrations + generate all mock data
 */

console.log("Starting compliance manager script...");

const db = require('../database/connection');
const mysql = require('mysql2/promise');
const config = require('../config/db');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Force console logging regardless of logger configuration
const originalInfo = logger.info;
logger.info = function(message, ...args) {
  console.log(message, ...args);
  return originalInfo.call(this, message, ...args);
};

// Command handlers
const commands = {
  'check-rules': checkRules,
  'check-checklists': checkChecklists,
  'generate-rules': generateRules,
  'generate-checklists': generateChecklists,
  'migrate': migrate,
  'migrate-down': migrateDown,
  'setup-all': setupAll
};

// Mock rules for generation
const mockRules = [
  // Illumination Rules (PEC 2017)
  {
    rule_code: 'PEC-2017-1075-01',
    title: 'Classroom Illumination Requirement',
    description: 'Classrooms must maintain a minimum illumination level of 300 lux for adequate visibility during educational activities.',
    severity: 'major',
    type: 'prescriptive',
    verification_method: 'Measure illumination levels at work surface height using calibrated light meter.',
    evaluation_criteria: 'Minimum 300 lux required for all classroom workspaces.',
    failure_impact: 'Insufficient lighting can cause eye strain, reduced concentration, and poor learning outcomes.',
    remediation_advice: 'Increase fixture density, upgrade lamps to higher output types, or lower fixture mounting height.',
    section_id: 1
  },
  {
    rule_code: 'PEC-2017-1075-02',
    title: 'Office Space Illumination Requirement',
    description: 'Office spaces must maintain illumination levels of at least 400 lux for adequate visibility during office work.',
    severity: 'major',
    type: 'prescriptive',
    verification_method: 'Measure illumination levels at desk height using calibrated light meter.',
    evaluation_criteria: 'Minimum 400 lux required for office workspaces.',
    failure_impact: 'Insufficient lighting can cause eye strain, headaches, and reduced productivity.',
    remediation_advice: 'Increase fixture density, upgrade lamps, or add task lighting at workstations.',
    section_id: 1
  },
  
  // Power Factor Rules
  {
    rule_code: 'PEC-2017-2050-01',
    title: 'Minimum Power Factor Requirement',
    description: 'Electrical installations must maintain a minimum power factor of 0.90 to minimize reactive power demand.',
    severity: 'critical',
    type: 'performance',
    verification_method: 'Measure power factor using power quality analyzer at main distribution panel.',
    evaluation_criteria: 'Power factor must be at least 0.90 under normal loading conditions.',
    failure_impact: 'Low power factor results in increased current, higher losses, voltage drops, and potential utility penalties.',
    remediation_advice: 'Install power factor correction capacitors sized appropriately for the reactive load.',
    section_id: 2
  },
  
  // Harmonic Distortion Rules
  {
    rule_code: 'IEEE-519-2014-01',
    title: 'Maximum THD at PCC',
    description: 'Total Harmonic Distortion (THD) at the Point of Common Coupling must not exceed 5% for voltage levels up to 1kV.',
    severity: 'critical',
    type: 'performance',
    verification_method: 'Measure harmonic content using power quality analyzer at PCC.',
    evaluation_criteria: 'THD must be less than 5.0% for voltage levels up to 1kV.',
    failure_impact: 'Excessive harmonics can cause equipment overheating, nuisance tripping, and shortened equipment life.',
    remediation_advice: 'Install passive harmonic filters or active harmonic mitigation systems.',
    section_id: 3
  },
  
  // Schedule of Loads Rules
  {
    rule_code: 'PEC-2017-2250-01',
    title: 'Transformer Loading Limit',
    description: 'Transformers should not be loaded beyond 80% of their nameplate capacity under normal conditions.',
    severity: 'major',
    type: 'performance',
    verification_method: 'Calculate total connected load and compare to transformer rating.',
    evaluation_criteria: 'Connected load should not exceed 80% of transformer kVA rating.',
    failure_impact: 'Overloaded transformers operate at higher temperatures, reducing lifespan and increasing failure risk.',
    remediation_advice: 'Upgrade transformer, redistribute loads, or implement load shedding during peak periods.',
    section_id: 4
  }
];

// Mock checklist templates
const mockChecklists = [
  {
    name: 'Basic Illumination Compliance Checklist',
    description: 'Verify compliance with basic illumination requirements from PEC 2017.',
    rule_codes: ['PEC-IL-001', 'PEC-IL-002', 'PEC-IL-003']
  },
  {
    name: 'Classroom & Office Lighting Checklist',
    description: 'Comprehensive verification of lighting requirements for educational and office spaces.',
    rule_codes: ['PEC-2017-1075-01', 'PEC-2017-1075-02', 'PEC-IL-001', 'PEC-IL-002']
  },
  {
    name: 'Power Quality Assessment Checklist',
    description: 'Verify power factor and harmonic distortion compliance.',
    rule_codes: ['PEC-2017-2050-01', 'IEEE-519-2014-01'] 
  },
  {
    name: 'Complete Electrical Compliance Checklist',
    description: 'Comprehensive checklist covering illumination, power quality, and load requirements.',
    rule_codes: ['PEC-IL-001', 'PEC-IL-002', 'PEC-IL-003', 'PEC-2017-1075-01', 'PEC-2017-2050-01', 'IEEE-519-2014-01', 'PEC-2017-2250-01']
  }
];

// Migration files to run
const migrationFiles = [
  'create_compliance_tables.js',
  'create_compliance_verification_tables.js',
  'create_tag_tables.js'
];

/**
 * Main function - parses command line arguments and runs the appropriate command
 */
async function main() {
  try {
    console.log("Main function started...");
    // Get command from command line arguments
    const command = process.argv[2];
    
    console.log(`Command received: ${command}`);
    
    if (!command) {
      showHelp();
      return;
    }
    
    if (!commands[command]) {
      console.error(`Unknown command: ${command}`);
      showHelp();
      return;
    }
    
    // Run the command
    console.log(`Executing command: ${command}`);
    await commands[command]();
    
  } catch (error) {
    console.error('Error executing command:', error);
    logger.error('Error executing command:', error);
  } finally {
    // Exit the process
    console.log("Script execution completed.");
    process.exit();
  }
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Compliance Manager - Unified script for compliance management

Usage:
  node compliance-manager.js <command>

Available commands:
  check-rules         - Check compliance rules in the database
  check-checklists    - Check compliance checklists in the database
  generate-rules      - Generate mock compliance rules
  generate-checklists - Generate mock compliance checklists
  migrate             - Run all compliance-related migrations
  migrate-down        - Roll back compliance-related migrations
  setup-all           - Run all migrations + generate all mock data
  `);
}

/**
 * Check compliance rules in the database
 */
async function checkRules() {
  try {
    console.log('Checking compliance rules in database...');
    
    // Check if compliance_rules table exists
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
        AND table_name = 'compliance_rules'
    `);
    
    if (tablesResult.length === 0) {
      console.error('compliance_rules table not found.');
      return;
    }
    
    // Get all rules
    const rules = await db.query(`
      SELECT * 
      FROM compliance_rules
    `);
    
    console.log(`Found ${rules.length} compliance rules in database.`);
    
    // Show details of each rule
    rules.forEach((rule, index) => {
      console.log(`--- Rule ${index + 1} ---`);
      console.log(`ID: ${rule.id}`);
      console.log(`Code: ${rule.rule_code}`);
      console.log(`Title: ${rule.title}`);
      console.log(`Description: ${rule.description.substring(0, 50)}...`);
      console.log(`Severity: ${rule.severity}`);
      console.log(`Type: ${rule.type}`);
      console.log(`-----------------`);
    });
    
  } catch (error) {
    console.error('Error checking compliance rules:', error);
  }
}

/**
 * Check compliance checklists in the database
 */
async function checkChecklists() {
  try {
    console.log('Checking compliance checklists in database...');
    
    // Check if tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
        AND table_name IN ('compliance_checklists', 'compliance_checks')
    `);
    
    const tables = tablesResult.map(row => row.table_name);
    
    if (!tables.includes('compliance_checklists') || !tables.includes('compliance_checks')) {
      console.error('Required tables not found. Please run migrations first.');
      return;
    }
    
    // Get all checklists
    const checklists = await db.query(`
      SELECT * 
      FROM compliance_checklists
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${checklists.length} compliance checklists in database.`);
    
    // Show details of each checklist
    for (const checklist of checklists) {
      console.log(`--- Checklist ID: ${checklist.id} ---`);
      console.log(`Name: ${checklist.name}`);
      console.log(`Description: ${checklist.description}`);
      console.log(`Status: ${checklist.status}`);
      console.log(`Created By: User ID ${checklist.created_by}`);
      
      // Get all checks for this checklist
      const checks = await db.query(
        `SELECT cc.*, cr.rule_code, cr.title as rule_title
         FROM compliance_checks cc
         JOIN compliance_rules cr ON cc.rule_id = cr.id
         WHERE cc.checklist_id = ?
         ORDER BY cr.rule_code`,
        [checklist.id]
      );
      
      console.log(`Total Checks: ${checks.length}`);
      
      // Count checks by status
      const statusCounts = {
        pending: checks.filter(c => c.status === 'pending').length,
        passed: checks.filter(c => c.status === 'passed').length,
        failed: checks.filter(c => c.status === 'failed').length,
        not_applicable: checks.filter(c => c.status === 'not_applicable').length
      };
      
      console.log(`Status Summary: Pending: ${statusCounts.pending}, Passed: ${statusCounts.passed}, Failed: ${statusCounts.failed}, N/A: ${statusCounts.not_applicable}`);
      
      // Show a few sample checks
      if (checks.length > 0) {
        console.log('Sample Checks:');
        const sampleSize = Math.min(3, checks.length);
        
        for (let i = 0; i < sampleSize; i++) {
          const check = checks[i];
          console.log(`  - Rule ${check.rule_code}: ${check.rule_title} (Status: ${check.status})`);
        }
        
        if (checks.length > sampleSize) {
          console.log(`  - ... and ${checks.length - sampleSize} more`);
        }
      }
      
      console.log('------------------------');
    }
    
  } catch (error) {
    console.error('Error checking compliance checklists:', error);
  }
}

/**
 * Generate mock compliance rules
 */
async function generateRules() {
  try {
    console.log('Starting mock compliance rules generation...');
    
    // Check if compliance_rules table exists
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
        AND table_name = 'compliance_rules'
    `);
    
    if (tablesResult.length === 0) {
      console.error('compliance_rules table not found. Run migrations first.');
      return false;
    }
    
    // Insert each rule
    let insertedCount = 0;
    
    for (const rule of mockRules) {
      // Check if rule already exists
      const existingRule = await db.query(
        'SELECT id FROM compliance_rules WHERE rule_code = ?',
        [rule.rule_code]
      );
      
      if (existingRule.length > 0) {
        console.log(`Rule ${rule.rule_code} already exists, skipping.`);
        continue;
      }
      
      // Insert rule
      const result = await db.query(
        `INSERT INTO compliance_rules 
         (rule_code, title, description, severity, type, verification_method, 
          evaluation_criteria, failure_impact, remediation_advice, section_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rule.rule_code,
          rule.title,
          rule.description,
          rule.severity,
          rule.type,
          rule.verification_method,
          rule.evaluation_criteria,
          rule.failure_impact,
          rule.remediation_advice,
          rule.section_id
        ]
      );
      
      if (result.affectedRows > 0) {
        insertedCount++;
        console.log(`Inserted rule: ${rule.rule_code}`);
      }
    }
    
    console.log(`Successfully inserted ${insertedCount} mock compliance rules.`);
    return true;
    
  } catch (error) {
    console.error('Error generating mock rules:', error);
    return false;
  }
}

/**
 * Generate mock compliance checklists
 */
async function generateChecklists() {
  try {
    console.log('Starting mock compliance checklists generation...');
    
    // Initialize database if not already initialized
    if (!db.pool) {
      console.log('Initializing database connection for checklist generation...');
      db.init();
    }
    
    // Check if compliance tables exist before proceeding
    try {
      // Check if required tables exist - use a direct query that won't be cached
      const tablesResult = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
          AND table_name IN ('compliance_rules', 'compliance_checklists', 'compliance_checks')
      `);
      
      const tables = tablesResult.map(row => row.table_name);
      console.log(`Found tables: ${tables.join(', ')}`);
      
      const missingTables = [];
      
      if (!tables.includes('compliance_rules')) missingTables.push('compliance_rules');
      if (!tables.includes('compliance_checklists')) missingTables.push('compliance_checklists');
      if (!tables.includes('compliance_checks')) missingTables.push('compliance_checks');
      
      if (missingTables.length > 0) {
        console.warn(`Missing tables: ${missingTables.join(', ')}. Migrations may not have completed successfully.`);
        
        // If tables are missing but migrations were already run, there's a database issue
        if (global.migrationsRun) {
          console.error('Tables still missing after migrations were run - there may be an issue with your database setup.');
          console.log('Attempting to directly create tables...');
          
          // Try direct table creation as a last resort
          if (missingTables.includes('compliance_rules')) {
            await db.query(`
              CREATE TABLE IF NOT EXISTS compliance_rules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                rule_code VARCHAR(50) NOT NULL UNIQUE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                severity ENUM('critical', 'major', 'minor') NOT NULL,
                type ENUM('prescriptive', 'performance', 'mandatory') NOT NULL,
                verification_method TEXT,
                evaluation_criteria TEXT,
                failure_impact TEXT,
                remediation_advice TEXT,
                section_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              )
            `);
            console.log('Directly created compliance_rules table');
          }
          
          if (missingTables.includes('compliance_checklists')) {
            await db.query(`
              CREATE TABLE IF NOT EXISTS compliance_checklists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_by INT,
                status ENUM('draft', 'active', 'archived') DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              )
            `);
            console.log('Directly created compliance_checklists table');
          }
          
          if (missingTables.includes('compliance_checks')) {
            await db.query(`
              CREATE TABLE IF NOT EXISTS compliance_checks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                checklist_id INT NOT NULL,
                rule_id INT NOT NULL,
                status ENUM('pending', 'passed', 'failed', 'not_applicable') DEFAULT 'pending',
                notes TEXT,
                evidence TEXT,
                checked_by INT,
                checked_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (checklist_id) REFERENCES compliance_checklists(id) ON DELETE CASCADE,
                FOREIGN KEY (rule_id) REFERENCES compliance_rules(id) ON DELETE CASCADE
              )
            `);
            console.log('Directly created compliance_checks table');
          }
        } else {
          // Run migrations if they haven't been run in this execution
          console.log('Running migrations to create missing tables...');
          global.migrationsRun = true;
          await migrate();
          
          // Force a new connection to ensure schema changes are visible
          if (db.pool) {
            console.log('Refreshing database connection...');
            try {
              await db.pool.end();
              db.pool = null;
              db.init();
              await db.query('SELECT 1'); // Dummy query to refresh connection
              console.log('Database connection refreshed successfully');
            } catch (err) {
              console.error('Error refreshing connection:', err.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking tables:', error.message);
      if (!global.migrationsRun) {
        console.log('Running migrations because of table check error...');
        global.migrationsRun = true;
        await migrate();
      } else {
        throw new Error('Database error even after running migrations: ' + error.message);
      }
    }
    
    // First check if compliance_rules table has data
    let rulesCount;
    try {
      rulesCount = await db.query(`
        SELECT COUNT(*) as count 
        FROM compliance_rules
      `);
      console.log(`Found ${rulesCount[0]?.count || 0} compliance rules`);
    } catch (error) {
      // If error still occurs after migrations, throw it
      throw new Error('Failed to query compliance_rules: ' + error.message);
    }
    
    if (!rulesCount[0] || rulesCount[0].count === 0) {
      console.warn('No compliance rules found. Please generate rules first.');
      console.log('Attempting to generate rules now...');
      await generateRules();
    }
    
    // Create a mock user ID if not specified
    const mockUserId = 1;
    
    // Process each checklist
    for (const checklist of mockChecklists) {
      // Check if checklist already exists
      const existingChecklist = await db.query(
        'SELECT id FROM compliance_checklists WHERE name = ?',
        [checklist.name]
      );
      
      if (existingChecklist.length > 0) {
        console.log(`Checklist "${checklist.name}" already exists, skipping.`);
        continue;
      }
      
      // Insert the checklist
      const result = await db.query(
        `INSERT INTO compliance_checklists 
         (name, description, created_by, status)
         VALUES (?, ?, ?, ?)`,
        [checklist.name, checklist.description, mockUserId, 'active']
      );
      
      const checklistId = result.insertId;
      console.log(`Created checklist: ${checklist.name} (ID: ${checklistId})`);
      
      // Get rule IDs for the specified rule codes
      const rulePromises = checklist.rule_codes.map(async (ruleCode) => {
        const rules = await db.query(
          'SELECT id FROM compliance_rules WHERE rule_code = ?',
          [ruleCode]
        );
        return rules.length > 0 ? rules[0].id : null;
      });
      
      const ruleIds = (await Promise.all(rulePromises)).filter(id => id !== null);
      
      if (ruleIds.length === 0) {
        console.warn(`No matching rules found for checklist "${checklist.name}"`);
        continue;
      }
      
      // Create checks for each rule
      for (const ruleId of ruleIds) {
        await db.query(
          `INSERT INTO compliance_checks 
           (checklist_id, rule_id, status)
           VALUES (?, ?, ?)`,
          [checklistId, ruleId, 'pending']
        );
      }
      
      console.log(`Added ${ruleIds.length} checks to checklist ID ${checklistId}`);
    }
    
    console.log('Successfully created mock compliance checklists.');
    return true;
  } catch (error) {
    console.error('Error creating mock checklists:', error);
    return false;
  }
}

/**
 * Run all compliance-related migrations
 */
async function migrate() {
  try {
    console.log('Running compliance migrations...');
    
    // Set global flag to track that migrations have been run
    global.migrationsRun = true;
    
    for (const migrationFile of migrationFiles) {
      const migrationPath = path.join(__dirname, '..', 'database', 'migrations', migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.warn(`Migration file not found: ${migrationPath}`);
        continue;
      }
      
      console.log(`Running migration: ${migrationFile}`);
      
      const migration = require(migrationPath);
      await migration.up();
      
      console.log(`Migration completed: ${migrationFile}`);
    }
    
    console.log('All compliance migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    global.migrationsRun = false; // Reset flag if migrations failed
    return false;
  }
}

/**
 * Roll back all compliance-related migrations
 */
async function migrateDown() {
  try {
    console.log('Rolling back compliance migrations...');
    
    // Run migrations in reverse order
    for (const migrationFile of [...migrationFiles].reverse()) {
      const migrationPath = path.join(__dirname, '..', 'database', 'migrations', migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.warn(`Migration file not found: ${migrationPath}`);
        continue;
      }
      
      console.log(`Rolling back migration: ${migrationFile}`);
      
      const migration = require(migrationPath);
      await migration.down();
      
      console.log(`Rollback completed: ${migrationFile}`);
    }
    
    console.log('All compliance migrations rolled back successfully');
    return true;
  } catch (error) {
    console.error('Error rolling back migrations:', error);
    return false;
  }
}

/**
 * Set up everything: run migrations and generate mock data
 */
async function setupAll() {
  try {
    console.log('=== STARTING COMPLIANCE SYSTEM SETUP ===');
    
    // Make sure database is initialized
    if (!db.pool) {
      console.log('Initializing database connection...');
      db.init();
    }
    
    // Run migrations
    console.log('Step 1: Running migrations...');
    const migrateSuccess = await migrate();
    
    if (!migrateSuccess) {
      console.error('Migration failed, aborting setup.');
      return;
    }
    
    // Force database reconnection to ensure schema changes are visible
    console.log('Refreshing database connection to ensure schema visibility...');
    if (db.pool) {
      // Close and reinitialize the connection pool
      try {
        await db.pool.end();
        db.pool = null;
      } catch (err) {
        console.warn('Error closing connection pool:', err.message);
      }
      
      // Reinitialize
      db.init();
      
      // Test connection
      try {
        const result = await db.query('SELECT 1 as test');
        console.log('Database connection refreshed successfully');
      } catch (err) {
        console.error('Failed to refresh database connection:', err.message);
        return;
      }
    }
    
    // Generate rules
    console.log('Step 2: Generating mock rules...');
    const rulesSuccess = await generateRules();
    
    if (!rulesSuccess) {
      console.error('Rules generation failed, aborting setup.');
      return;
    }
    
    // Generate checklists
    console.log('Step 3: Generating mock checklists...');
    const checklistsSuccess = await generateChecklists();
    
    if (!checklistsSuccess) {
      console.error('Checklists generation failed, aborting setup.');
      return;
    }
    
    console.log('=== COMPLIANCE SYSTEM SETUP COMPLETED SUCCESSFULLY ===');
    console.log('You can now verify the setup with:');
    console.log('  node compliance-manager.js check-rules');
    console.log('  node compliance-manager.js check-checklists');
    
  } catch (error) {
    console.error('Error during setup:', error);
  }
}

// Run the main function
console.log("Calling main function...");
main();
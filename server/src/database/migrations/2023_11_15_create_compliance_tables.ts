import { Knex } from 'knex';

/**
 * Create tables for compliance checkers
 */
export async function up(knex: Knex): Promise<void> {
  // First check if tables already exist
  const complianceRulesExists = await knex.schema.hasTable('compliance_rules');
  const complianceChecklistsExists = await knex.schema.hasTable('compliance_checklists');
  const complianceChecksExists = await knex.schema.hasTable('compliance_checks');
  
  // Create compliance_rules table if it doesn't exist
  if (!complianceRulesExists) {
    await knex.schema.createTable('compliance_rules', (table) => {
      table.increments('id').primary();
      table.integer('section_id').notNullable().references('id').inTable('sections').onDelete('CASCADE');
      table.string('rule_code').notNullable();
      table.string('title').notNullable();
      table.text('description').notNullable();
      table.enum('severity', ['critical', 'major', 'minor']).defaultTo('major');
      table.enum('type', ['prescriptive', 'performance', 'mandatory']).defaultTo('mandatory');
      table.string('verification_method').nullable();
      table.text('evaluation_criteria').nullable();
      table.text('failure_impact').nullable();
      table.text('remediation_advice').nullable();
      table.boolean('active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').nullable();
    });
    
    console.log('Created compliance_rules table');
  }
  
  // Create compliance_checklists table if it doesn't exist
  if (!complianceChecklistsExists) {
    await knex.schema.createTable('compliance_checklists', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description').nullable();
      table.integer('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.enum('status', ['draft', 'active', 'archived']).defaultTo('draft');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').nullable();
    });
    
    console.log('Created compliance_checklists table');
  }
  
  // Create compliance_checks table if it doesn't exist
  if (!complianceChecksExists) {
    await knex.schema.createTable('compliance_checks', (table) => {
      table.increments('id').primary();
      table.integer('checklist_id').notNullable().references('id').inTable('compliance_checklists').onDelete('CASCADE');
      table.integer('rule_id').notNullable().references('id').inTable('compliance_rules').onDelete('CASCADE');
      table.enum('status', ['pending', 'passed', 'failed', 'not_applicable']).defaultTo('pending');
      table.text('notes').nullable();
      table.text('evidence').nullable(); // JSON field to store evidence references (e.g., photo URLs)
      table.integer('checked_by').nullable().references('id').inTable('users');
      table.timestamp('checked_at').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').nullable();
      
      // Add a unique constraint to prevent duplicate rule checks in a checklist
      table.unique(['checklist_id', 'rule_id']);
    });
    
    console.log('Created compliance_checks table');
  }
  
  // Insert some default compliance rules if the table was just created
  if (!complianceRulesExists) {
    // We'll need to get some section IDs first to reference them properly
    const illuminationSections = await knex('sections')
      .where('title', 'like', '%illumination%')
      .orWhere('title', 'like', '%lighting%')
      .select('id')
      .limit(5);
    
    if (illuminationSections.length > 0) {
      const defaultRules = [
        {
          section_id: illuminationSections[0].id,
          rule_code: 'PEC-IL-001',
          title: 'Minimum Illumination Levels',
          description: 'Illumination levels must meet minimum requirements specified in PEC 2017 for the specific room type and usage.',
          severity: 'critical',
          type: 'mandatory',
          verification_method: 'On-site measurement with calibrated light meter',
          evaluation_criteria: 'Measured average lux level must be at least 90% of required minimum',
          failure_impact: 'Insufficient lighting causing eye strain, safety hazards, and reduced productivity',
          remediation_advice: 'Increase lamp power, add fixtures, or reduce fixture spacing'
        },
        {
          section_id: illuminationSections[0].id,
          rule_code: 'PEC-IL-002',
          title: 'Light Uniformity',
          description: 'Illumination must be uniformly distributed to avoid dark spots and excessive brightness variation.',
          severity: 'major',
          type: 'performance',
          verification_method: 'Measurement grid of 9 points minimum per standard room',
          evaluation_criteria: 'Minimum to maximum ratio should not exceed 1:3',
          failure_impact: 'Visual discomfort, reduced visibility, and increased risk of accidents',
          remediation_advice: 'Adjust fixture spacing, add supplementary lighting, or use diffusers'
        }
      ];
      
      if (illuminationSections.length > 1) {
        defaultRules.push({
          section_id: illuminationSections[1].id,
          rule_code: 'PEC-IL-003',
          title: 'Emergency Lighting Compliance',
          description: 'Emergency lighting must provide minimum illumination for safe egress during power failures.',
          severity: 'critical',
          type: 'mandatory',
          verification_method: 'Visual inspection and light meter measurement during simulated power failure',
          evaluation_criteria: 'Minimum 10 lux at floor level along egress paths',
          failure_impact: 'Life safety risk during emergency evacuation',
          remediation_advice: 'Install additional emergency fixtures or adjust placement'
        });
      }
      
      await knex('compliance_rules').insert(defaultRules);
      console.log('Inserted default compliance rules');
    }
  }
}

/**
 * Drop compliance-related tables
 */
export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order (to handle foreign key constraints)
  if (await knex.schema.hasTable('compliance_checks')) {
    await knex.schema.dropTable('compliance_checks');
    console.log('Dropped compliance_checks table');
  }
  
  if (await knex.schema.hasTable('compliance_checklists')) {
    await knex.schema.dropTable('compliance_checklists');
    console.log('Dropped compliance_checklists table');
  }
  
  if (await knex.schema.hasTable('compliance_rules')) {
    await knex.schema.dropTable('compliance_rules');
    console.log('Dropped compliance_rules table');
  }
} 
import { Knex } from 'knex';

/**
 * Create tables for tag management
 */
export async function up(knex: Knex): Promise<void> {
  // First check if tables already exist
  const sectionTagsExists = await knex.schema.hasTable('section_tags');
  const sectionTagMappingsExists = await knex.schema.hasTable('section_tag_mappings');
  
  // Create section_tags table if it doesn't exist
  if (!sectionTagsExists) {
    await knex.schema.createTable('section_tags', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').nullable();
    });
    
    console.log('Created section_tags table');
  }
  
  // Create section_tag_mappings table if it doesn't exist
  if (!sectionTagMappingsExists) {
    await knex.schema.createTable('section_tag_mappings', (table) => {
      table.increments('id').primary();
      table.integer('section_id').notNullable().references('id').inTable('sections').onDelete('CASCADE');
      table.integer('tag_id').notNullable().references('id').inTable('section_tags').onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      // Add a unique constraint to prevent duplicate mappings
      table.unique(['section_id', 'tag_id']);
    });
    
    console.log('Created section_tag_mappings table');
  }
  
  // Insert some default tags if the tags table was just created
  if (!sectionTagsExists) {
    const defaultTags = [
      { name: 'illumination' },
      { name: 'emergency lighting' },
      { name: 'power quality' },
      { name: 'grounding' },
      { name: 'load calculation' },
      { name: 'motor' },
      { name: 'transformer' },
      { name: 'overcurrent protection' },
      { name: 'distribution' },
      { name: 'wiring' }
    ];
    
    await knex('section_tags').insert(defaultTags);
    console.log('Inserted default tags');
  }
}

/**
 * Drop tag-related tables
 */
export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order (to handle foreign key constraints)
  if (await knex.schema.hasTable('section_tag_mappings')) {
    await knex.schema.dropTable('section_tag_mappings');
    console.log('Dropped section_tag_mappings table');
  }
  
  if (await knex.schema.hasTable('section_tags')) {
    await knex.schema.dropTable('section_tags');
    console.log('Dropped section_tags table');
  }
} 
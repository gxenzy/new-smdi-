/**
 * Migration to create the audit workflow tables
 */
exports.up = function(knex) {
  return Promise.all([
    // Create audit_tasks table
    knex.schema.createTable('audit_tasks', function(table) {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.text('description');
      table.enum('status', ['not_started', 'in_progress', 'completed']).defaultTo('not_started').notNullable();
      table.enum('priority', ['low', 'medium', 'high']).defaultTo('medium').notNullable();
      table.integer('assigned_to').unsigned();
      table.integer('created_by').unsigned().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.date('due_date');
      table.date('completed_date');
      table.enum('approval_status', ['not_submitted', 'pending', 'approved', 'rejected']).defaultTo('not_submitted').notNullable();
      table.integer('approved_by').unsigned();
      table.timestamp('approved_date');
      
      // Foreign keys
      table.foreign('assigned_to').references('id').inTable('users');
      table.foreign('created_by').references('id').inTable('users');
      table.foreign('approved_by').references('id').inTable('users');
    }),

    // Create task_comments table
    knex.schema.createTable('task_comments', function(table) {
      table.increments('id').primary();
      table.integer('task_id').unsigned().notNullable();
      table.text('comment').notNullable();
      table.integer('user_id').unsigned().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      // Foreign keys
      table.foreign('task_id').references('id').inTable('audit_tasks').onDelete('CASCADE');
      table.foreign('user_id').references('id').inTable('users');
    }),

    // Create task_history table
    knex.schema.createTable('task_history', function(table) {
      table.increments('id').primary();
      table.integer('task_id').unsigned().notNullable();
      table.string('field_name', 50).notNullable();
      table.text('old_value');
      table.text('new_value');
      table.integer('changed_by').unsigned().notNullable();
      table.timestamp('changed_at').defaultTo(knex.fn.now());
      
      // Foreign keys
      table.foreign('task_id').references('id').inTable('audit_tasks').onDelete('CASCADE');
      table.foreign('changed_by').references('id').inTable('users');
    }),

    // Create task_attachments table
    knex.schema.createTable('task_attachments', function(table) {
      table.increments('id').primary();
      table.integer('task_id').unsigned().notNullable();
      table.string('file_name', 255).notNullable();
      table.string('file_path', 255).notNullable();
      table.string('file_type', 50);
      table.integer('file_size');
      table.integer('uploaded_by').unsigned().notNullable();
      table.timestamp('uploaded_at').defaultTo(knex.fn.now());
      
      // Foreign keys
      table.foreign('task_id').references('id').inTable('audit_tasks').onDelete('CASCADE');
      table.foreign('uploaded_by').references('id').inTable('users');
    }),

    // Create task_categories table
    knex.schema.createTable('task_categories', function(table) {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('description', 255);
      table.string('color', 7); // Hex color code
    }),

    // Create task_category_assignments table for many-to-many relationship
    knex.schema.createTable('task_category_assignments', function(table) {
      table.increments('id').primary();
      table.integer('task_id').unsigned().notNullable();
      table.integer('category_id').unsigned().notNullable();
      
      // Foreign keys
      table.foreign('task_id').references('id').inTable('audit_tasks').onDelete('CASCADE');
      table.foreign('category_id').references('id').inTable('task_categories').onDelete('CASCADE');
      
      // Unique constraint to prevent duplicates
      table.unique(['task_id', 'category_id']);
    }),

    // Create task_related_items table for linking tasks to other entities
    knex.schema.createTable('task_related_items', function(table) {
      table.increments('id').primary();
      table.integer('task_id').unsigned().notNullable();
      table.string('related_type', 50).notNullable(); // e.g., 'calculation', 'compliance', 'standard'
      table.integer('related_id').unsigned().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      // Foreign key
      table.foreign('task_id').references('id').inTable('audit_tasks').onDelete('CASCADE');
      
      // Unique constraint to prevent duplicates
      table.unique(['task_id', 'related_type', 'related_id']);
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('task_related_items'),
    knex.schema.dropTableIfExists('task_category_assignments'),
    knex.schema.dropTableIfExists('task_categories'),
    knex.schema.dropTableIfExists('task_attachments'),
    knex.schema.dropTableIfExists('task_history'),
    knex.schema.dropTableIfExists('task_comments'),
    knex.schema.dropTableIfExists('audit_tasks')
  ]);
}; 
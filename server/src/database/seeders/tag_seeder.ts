import { Knex } from 'knex';
import { db } from '../connection';

/**
 * Seed tag data and tag mappings for sections
 */
export async function seedTags(knex: Knex = db): Promise<void> {
  console.log('Starting tag seeding...');
  
  // Check if tags already exist
  const existingTags = await knex('section_tags').count('id as count').first();
  
  if (existingTags && Number(existingTags.count) > 0) {
    console.log(`Found ${existingTags.count} existing tags, skipping tag creation`);
  } else {
    // Insert tags
    const tags = [
      { name: 'illumination' },
      { name: 'emergency lighting' },
      { name: 'power quality' },
      { name: 'grounding' },
      { name: 'load calculation' },
      { name: 'motor' },
      { name: 'transformer' },
      { name: 'overcurrent protection' },
      { name: 'distribution' },
      { name: 'wiring' },
      { name: 'safety' },
      { name: 'energy efficiency' },
      { name: 'protection' },
      { name: 'conductor sizing' },
      { name: 'voltage drop' },
      { name: 'harmonic distortion' },
      { name: 'power factor' },
      { name: 'residential' },
      { name: 'commercial' },
      { name: 'industrial' }
    ];
    
    await knex('section_tags').insert(tags);
    console.log(`Inserted ${tags.length} tags`);
  }
  
  // Check if mappings already exist
  const existingMappings = await knex('section_tag_mappings').count('id as count').first();
  
  if (existingMappings && Number(existingMappings.count) > 0) {
    console.log(`Found ${existingMappings.count} existing tag mappings, skipping mapping creation`);
    return;
  }
  
  // Get sections and tags for mapping
  const sections = await knex('sections').select('id', 'title', 'content');
  const tags = await knex('section_tags').select('id', 'name');
  
  if (sections.length === 0) {
    console.log('No sections found, skipping tag mappings');
    return;
  }
  
  if (tags.length === 0) {
    console.log('No tags found, skipping tag mappings');
    return;
  }
  
  console.log(`Found ${sections.length} sections and ${tags.length} tags for mapping`);
  
  // Create mappings array
  const mappings = [];
  
  // Helper function to check if content contains tag keywords
  const contentContainsTag = (content: string, tagName: string): boolean => {
    return content.toLowerCase().includes(tagName.toLowerCase());
  };
  
  // For each section, find relevant tags and create mappings
  for (const section of sections) {
    const relevantTags = tags.filter(tag => 
      contentContainsTag(section.title, tag.name) || 
      contentContainsTag(section.content, tag.name)
    );
    
    for (const tag of relevantTags) {
      mappings.push({
        section_id: section.id,
        tag_id: tag.id,
        created_at: new Date()
      });
    }
  }
  
  // If we have any mappings, insert them in batches to avoid potential issues with large datasets
  if (mappings.length > 0) {
    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < mappings.length; i += batchSize) {
      const batch = mappings.slice(i, i + batchSize);
      
      try {
        await knex('section_tag_mappings').insert(batch);
        inserted += batch.length;
        console.log(`Inserted batch of ${batch.length} tag mappings (${inserted}/${mappings.length})`);
      } catch (error) {
        // Log error but continue with next batch
        console.error(`Error inserting batch of tag mappings:`, error);
      }
    }
    
    console.log(`Finished inserting ${inserted} tag mappings`);
  } else {
    console.log('No relevant tag mappings found based on content');
  }
}

// Run the seeder if executed directly
if (require.main === module) {
  seedTags()
    .then(() => {
      console.log('Tag seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error during tag seeding:', error);
      process.exit(1);
    });
} 
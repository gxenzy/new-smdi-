/**
 * Script to seed tag data for standards sections
 * Run with: npm run seed:tags
 */

import { seedTags } from '../database/seeders/tag_seeder';
import logger from '../utils/logger';

logger.info('Starting tag seeding process...');

seedTags()
  .then(() => {
    logger.info('Tag seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Error during tag seeding:', error);
    process.exit(1);
  }); 
# Tag Management System Documentation

## Overview

The Tag Management System allows users to organize standards content using a flexible tagging system. This enables more efficient searching, filtering, and categorization of standards sections, making it easier to find relevant content.

## Features

- **Tag Creation and Management**: Administrators can create, edit, and delete tags.
- **Tag Assignment**: Tags can be assigned to standards sections based on content relevance.
- **Tag-Based Filtering**: Users can filter search results by selecting one or more tags.
- **Search Integration**: Tags are integrated with the main search functionality.
- **Tag Suggestions**: The system provides tag suggestions based on search terms.

## Components

### Backend Components

#### Database Schema

The tag system uses two main tables:

1. **section_tags**: Stores tag metadata
   - `id`: Primary key
   - `name`: Tag name (unique)
   - `created_at`: Creation timestamp
   - `updated_at`: Last update timestamp

2. **section_tag_mappings**: Stores relationships between tags and sections
   - `id`: Primary key
   - `section_id`: Foreign key to sections table
   - `tag_id`: Foreign key to section_tags table
   - `created_at`: Creation timestamp

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tags/tags` | GET | Get all tags |
| `/api/tags/tags` | POST | Create a new tag |
| `/api/tags/tags/:id` | PUT | Update a tag |
| `/api/tags/tags/:id` | DELETE | Delete a tag |
| `/api/tags/sections/:sectionId/tags` | GET | Get tags for a section |
| `/api/tags/section-tags` | POST | Add a tag to a section |
| `/api/tags/sections/:sectionId/tags/:tagId` | DELETE | Remove a tag from a section |

### Frontend Components

#### TagFilter Component

The `TagFilter` component provides a user interface for filtering search results by tags. Features include:

- Expandable accordion interface
- Tag search functionality
- Selection of multiple tags
- Tag count indicator
- Clear selection option

#### TagManagement Component

The `TagManagement` component allows administrators to manage tags. Features include:

- Creating new tags
- Editing existing tags
- Deleting tags (with confirmation)
- Searching across tags
- Tagging statistics

#### Integration with StandardsSearch

The tag system is integrated with the main standards search functionality:

- Tag-based filtering in search results
- Tag chips displayed on search results
- Clicking on a tag in search results adds it to the filter
- Search history includes selected tags

## Using the Tag System

### For End Users

1. **Searching with Tags**:
   - Open the Standards Search component
   - Click on "Toggle Filters" to show the filter panel
   - Use the TagFilter component to select one or more tags
   - Click Search to filter results by the selected tags

2. **Exploring Tags in Results**:
   - Each search result displays relevant tags as chips
   - Click on a tag chip in a result to add it to your filter criteria
   - The search will automatically update with the new tag filter

### For Administrators

1. **Managing Tags**:
   - Access the Tag Management component
   - Create new tags using the "New Tag Name" input
   - Edit existing tags by clicking the edit icon
   - Delete tags by clicking the delete icon (confirm in the dialog)

2. **Assigning Tags to Sections**:
   - Automatic tagging is done during seeding based on content
   - Manual tag assignment can be done through the admin API

## Implementation Details

### Tag Seeding

The system includes a tag seeder that automatically:

1. Creates a set of default tags relevant to electrical standards
2. Analyzes section content and assigns tags based on keyword matching
3. Creates tag-section mappings in batches for performance

To run the tag seeder:

```bash
npm run seed:tags
```

### Search Integration

The search system has been enhanced to:

1. Accept tag IDs as additional filter criteria
2. Join the tag tables appropriately in the query
3. Include tag information in the search results
4. Provide tag-based suggestions in the autocomplete system

### Error Handling

The tag system uses a standardized error handling approach:

- Validation of inputs (tag names, IDs, etc.)
- Proper error responses with type information
- Transaction support for operations that modify multiple tables
- Comprehensive logging

## Development Roadmap

Future enhancements to the tag system may include:

1. **Tag Analytics**: Statistics on most used tags, tag trends, etc.
2. **Tag Relationships**: Creating hierarchical or related tag structures
3. **Tag Automation**: Improved automatic tagging using NLP
4. **Tag Visualization**: Tag clouds and other visual representations
5. **User-Specific Tags**: Personal tagging system for users 
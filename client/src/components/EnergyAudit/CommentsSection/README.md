# CommentsSection Component

A reusable React component for displaying and managing comments in the Energy Audit module.

## Features

- Display a list of comments with author and timestamp
- Add new comments with keyboard shortcuts
- Support for multiline comments
- **User mentions with autocomplete** (`@username`)
- **Markdown support** (bold, italics, links, lists, etc.)
- **Attachments** (images/files, with preview and download)
- Responsive design using Material-UI components

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| comments | Comment[] | Yes | Array of comments to display (with optional attachments) |
| onAddComment | (text: string, attachments?: Attachment[]) => void | Yes | Callback when a new comment is added |
| onEditComment | (id: string, text: string, attachments?: Attachment[]) => void | Yes | Callback when a comment is edited |
| onDeleteComment | (id: string) => void | Yes | Callback when a comment is deleted |
| currentUser | string | Yes | Name of the current user |
| users | User[] | No | List of users for mentions/autocomplete |

## Types

```typescript
interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  attachments?: Attachment[];
}

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface User {
  id: string;
  name: string;
}
```

## Usage Example

```tsx
import CommentsSection from './CommentsSection';

const users = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
];

const comments = [
  {
    id: '1',
    text: 'This is a comment with @Jane Smith and **markdown**.',
    author: 'John Doe',
    createdAt: new Date().toISOString(),
    attachments: [
      { name: 'file.txt', url: 'blob:http://localhost/file.txt', type: 'text/plain' },
    ],
  },
];

const handleAddComment = (text: string, attachments?: Attachment[]) => {
  // Handle adding new comment
  console.log('New comment:', text, attachments);
};

return (
  <CommentsSection
    comments={comments}
    onAddComment={handleAddComment}
    onEditComment={(id, text, attachments) => {}}
    onDeleteComment={id => {}}
    currentUser="John Doe"
    users={users}
  />
);
```

## Keyboard Shortcuts

- `Enter`: Submit the comment
- `Shift + Enter`: Add a new line in the comment input

## Mentions

- Type `@` to trigger a dropdown of users to mention.
- Mentions are highlighted in the comment text.
- Mentioned users can be notified via callback (if implemented in parent).

## Markdown Support

- Supports **bold**, *italic*, [links](https://example.com), lists, etc.
- Uses `react-markdown` for rendering.

## Attachments

- Attach files/images to comments (add/edit)
- Images are previewed, other files are downloadable
- Multiple attachments supported

## Styling

The component uses Material-UI components and follows the application's theme. Key styling features:

- Dense list for compact comment display
- Multiline text field for comment input
- Outlined button for comment submission
- Responsive layout that adapts to container width
- Chips for mentions
- File/image previews

## Testing

The component includes comprehensive tests covering:

- Rendering of comments
- Comment addition, editing, deletion
- Input handling
- Mentions and autocomplete
- Markdown rendering
- Attachments
- Empty state
- Button disabled state
- Timestamp formatting
- Keyboard shortcuts

## Dependencies

- @mui/material
- @mui/icons-material
- react-markdown

## Contributing

When contributing to this component:

1. Maintain the existing prop interface
2. Add tests for new features
3. Update documentation for any changes
4. Follow the Material-UI design patterns
5. Ensure keyboard accessibility is maintained 
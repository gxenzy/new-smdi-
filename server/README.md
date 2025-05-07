# Energy Audit System Backend

This is the backend server for the Energy Audit System, built with Node.js, Express, and TypeScript.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=energy_audit_db
   JWT_SECRET=your_secret_key
   ```

4. Set up the database:
   - Create a MySQL database named `energy_audit_db`
   - Run the schema.sql file to create the necessary tables:
     ```bash
     mysql -u root -p energy_audit_db < src/database/schema.sql
     ```

## Development

To run the server in development mode:
```bash
npm run dev
```

## Production

To build and run the server in production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PATCH /api/users/:id/toggle-status` - Toggle user status (Admin only)
- `PATCH /api/users/bulk-update` - Bulk update users (Admin only)
- `POST /api/users/bulk-delete` - Bulk delete users (Admin only)

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Testing

To run tests:
```bash
npm test
``` 
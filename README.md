# SMDI Energy Audit Platform

This is a web-based platform for managing energy audits, user teams, analytics, and workflow approvals. The project is built with a React frontend and Node.js backend.

## Features

- User authentication and management
- Energy audit data entry and analytics
- Workflow approval system
- Notification system
- Team and role management
- Admin dashboard and settings

## Tech Stack

- **Frontend:** React, TypeScript, Material-UI
- **Backend:** Node.js, Express
- **Database:** (Add your DB here, e.g., PostgreSQL, MySQL, SQLite)
- **State Management:** Redux Toolkit

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/gxenzy/new-smdi-.git
   cd new-smdi-
   ```

2. Install dependencies for the client:
   ```sh
   cd client
   npm install
   ```

3. (If you have a server directory, add server setup instructions here.)

### Running the App

- **Frontend:**
  ```sh
  cd client
  npm start
  ```

- **Backend:**
  ```sh
  # Add backend start instructions here if applicable
  ```

### Database Setup

- Run the provided SQL scripts to set up your database:
  - `create_database_and_tables.sql`
  - `setup_database.sql`
  - `setup_energy_monitoring_tables.sql`

### Environment Variables

- Copy `.env.example` to `.env` and fill in your environment variables.

## Folder Structure

```
client/           # React frontend
middleware/       # Express middleware
models/           # Database models
routes/           # API routes
services/         # Service logic
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

---

*Feel free to update this README with more specific details about your project!*

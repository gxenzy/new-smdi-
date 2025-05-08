# SMDI Admin Panel

A full-stack web application for energy audit management and monitoring.

## Project Structure

```
/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context providers
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service calls
│   │   ├── store/        # Redux store
│   │   └── types/        # TypeScript type definitions
│   └── package.json      # Frontend dependencies
│
├── server/                # Node.js/Express Backend
│   ├── models/           # Sequelize database models
│   ├── routes/           # Express API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── server.js         # Main server file
│   └── package.json      # Backend dependencies
│
├── nginx.conf            # Nginx configuration
├── Dockerfile            # Docker configuration
└── README.md            # This file
```

## Prerequisites

- Node.js >= 14.x
- MySQL >= 8.0
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   mysql -u your_username -p < setup_database.sql
   mysql -u your_username -p < create_database_and_tables.sql
   mysql -u your_username -p < setup_energy_monitoring_tables.sql
   ```

4. Create a .env file in the server directory:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASS=your_password
   DB_NAME=smdi_db
   JWT_SECRET=your_jwt_secret
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the client directory:
   ```
   REACT_APP_API_URL=http://localhost:8000/api
   REACT_APP_WS_URL=ws://localhost:8000
   REACT_APP_VERSION=1.0.0
   REACT_APP_TITLE=Energy Audit System
   SKIP_PREFLIGHT_CHECK=true
   TSC_COMPILE_ON_ERROR=true
   GENERATE_SOURCEMAP=true
   ```

   **Note:** Each variable must be on its own line. Do NOT put them all on one line.

4. Start the frontend development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000

## Features

- User Authentication & Authorization
- Energy Audit Management
- Real-time Monitoring
- Analytics & Reporting
- User Management
- Admin Settings
- Profile Management

## Technologies Used

### Frontend
- React
- TypeScript
- Material-UI
- Redux Toolkit
- Socket.io Client
- Chart.js
- Formik & Yup

### Backend
- Node.js
- Express
- MySQL
- Sequelize ORM
- Socket.io
- JWT Authentication
- bcrypt

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Feel free to update this README with more specific details about your project!*

## Troubleshooting

### API Authentication or 401/403 Errors
- Ensure your `client/.env` file is formatted with one variable per line (see above).
- The `REACT_APP_API_URL` must match your backend port and end with `/api` (e.g., `http://localhost:8000/api`).
- After editing `.env`, always restart the frontend (`npm start`).
- Log out and log in again if you change the API URL.

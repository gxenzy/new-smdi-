import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import findingsRoutes from './routes/findings';
import attachmentsRoutes from './routes/attachments';
import commentsRoutes from './routes/comments';
import notificationsRoutes from './routes/notifications';
import adminSettingsRoutes from './routes/adminSettingsRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import userRoutes from './routes/userRoutes';
import energyAuditRouter from './routes/energyAuditRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/findings', findingsRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/energy-audit', energyAuditRouter);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app; 
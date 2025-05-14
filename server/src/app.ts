import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorMiddleware } from './utils/errorHandler';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/userRoutes';
import findingsRoutes from './routes/findings';
import attachmentsRoutes from './routes/attachments';
import commentsRoutes from './routes/comments';
import notificationsRoutes from './routes/notifications';
import adminSettingsRoutes from './routes/adminSettingsRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import energyAuditRouter from './routes/energyAuditRoutes';
import searchRoutes from './routes/searchRoutes';
import standardsRoutes from './routes/standardsRoutes';
import tagRoutes from './routes/tagRoutes';
import complianceRoutes from './routes/complianceRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/findings', findingsRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/energy-audit', energyAuditRouter);
app.use('/api/search', searchRoutes);
app.use('/api/standards', standardsRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/compliance', complianceRoutes);

// Custom error handling middleware
app.use(errorMiddleware);

export default app; 
import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import energyRoutes from './energyRoutes';
import floorplanRoutes from './floorplanRoutes';
import findingsRouter from './findingsRoutes';
import attachmentsRouter from './attachmentsRoutes';
import commentsRouter from './commentsRoutes';
import notificationsRouter from './notificationsRoutes';
import dashboardRouter from './dashboardRoutes';
import auditLogRoutes from './auditLogRoutes';
import reportRoutes from './reportRoutes';
import standardsRoutes from './standardsRoutes';

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/energy', energyRoutes);
router.use('/floorplans', floorplanRoutes);
router.use('/findings', findingsRouter);
router.use('/attachments', attachmentsRouter);
router.use('/comments', commentsRouter);
router.use('/notifications', notificationsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/audit-log', auditLogRoutes);
router.use('/reports', reportRoutes);
router.use('/standards-api', standardsRoutes);

export default router; 
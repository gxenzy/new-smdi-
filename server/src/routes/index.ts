import { Router } from 'express';
import userRouter from './userRoutes';
import findingsRouter from './findingsRoutes';
import authRouter from './authRoutes';
import attachmentsRouter from './attachmentsRoutes';
import commentsRouter from './commentsRoutes';
import notificationsRouter from './notificationsRoutes';
import dashboardRouter from './dashboardRoutes';
import auditLogRoutes from './auditLogRoutes';

const router = Router();

// Mount all routes
router.use('/users', userRouter);
router.use('/findings', findingsRouter);
router.use('/auth', authRouter);
router.use('/attachments', attachmentsRouter);
router.use('/comments', commentsRouter);
router.use('/notifications', notificationsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/audit-log', auditLogRoutes);

export default router; 
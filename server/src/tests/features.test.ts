import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import app from '../app';
import { pool } from '../config/database';

describe('Features Integration Tests', () => {
  let authToken: string;
  let findingId: number;
  let attachmentId: number;
  let commentId: number;
  let notificationId: number;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    authToken = loginResponse.body.token;

    // Create a test finding
    const findingResponse = await request(app)
      .post('/api/findings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Finding',
        description: 'Test Description',
        type: 'Efficiency',
        status: 'Open',
        auditId: 1
      });
    findingId = findingResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (findingId) {
      await request(app)
        .delete(`/api/findings/${findingId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
    
    // Close database connection
    await pool.end();
  });

  describe('File Attachments', () => {
    const testFilePath = path.join(__dirname, 'test-file.txt');
    
    beforeAll(() => {
      // Create a test file
      fs.writeFileSync(testFilePath, 'Test file content');
    });

    afterAll(() => {
      // Cleanup test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    it('should upload a file attachment', async () => {
      const response = await request(app)
        .post(`/api/findings/${findingId}/attachments`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      attachmentId = response.body.id;
    });

    it('should download a file attachment', async () => {
      const response = await request(app)
        .get(`/api/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('text/plain');
      expect(response.text).toBe('Test file content');
    });

    it('should delete a file attachment', async () => {
      const response = await request(app)
        .delete(`/api/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Comments', () => {
    it('should create a comment', async () => {
      const response = await request(app)
        .post(`/api/findings/${findingId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test comment'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      commentId = response.body.id;
    });

    it('should get comments for a finding', async () => {
      const response = await request(app)
        .get(`/api/findings/${findingId}/comments`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should update a comment', async () => {
      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated test comment'
        });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('Updated test comment');
    });

    it('should delete a comment', async () => {
      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Notifications', () => {
    it('should create a notification', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          findingId,
          type: 'UPDATED',
          message: 'Test notification'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      notificationId = response.body.id;
    });

    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should mark notification as read', async () => {
      const response = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.is_read).toBe(true);
    });
  });
}); 
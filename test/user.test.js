const request = require('supertest');
const app = require('../server'); // Adjust if your app is exported differently
let createdId;

describe('User API', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        username: 'testuser',
        password: 'testpass123',
        email: 'testuser@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.username).toBe('testuser');
    createdId = res.body._id || res.body.id;
  });

  it('should get all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get user by id', async () => {
    const res = await request(app).get(`/api/users/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('testuser');
  });

  it('should update a user', async () => {
    const res = await request(app)
      .put(`/api/users/${createdId}`)
      .send({ firstName: 'Updated', lastName: 'User', role: 'ADMIN' });
    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe('Updated');
    expect(res.body.role).toBe('ADMIN');
  });

  it('should delete a user', async () => {
    const res = await request(app).delete(`/api/users/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User deleted');
  });
}); 
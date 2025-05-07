const request = require('supertest');
const app = require('../server'); // Adjust if your app is exported differently
let createdId;

describe('Energy Audit API', () => {
  it('should create a new audit', async () => {
    const res = await request(app)
      .post('/api/energy-audit')
      .send({ name: 'Test Audit', status: 'Pending' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Audit');
    createdId = res.body._id || res.body.id;
  });

  it('should get all audits', async () => {
    const res = await request(app).get('/api/energy-audit');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get audit by id', async () => {
    const res = await request(app).get(`/api/energy-audit/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Audit');
  });

  it('should update an audit', async () => {
    const res = await request(app)
      .put(`/api/energy-audit/${createdId}`)
      .send({ name: 'Updated Audit', status: 'Completed' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Audit');
    expect(res.body.status).toBe('Completed');
  });

  it('should delete an audit', async () => {
    const res = await request(app).delete(`/api/energy-audit/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Audit deleted');
  });
}); 
const request = require('supertest');
const app = require('../index');
beforeAll(() => new Promise(res => setTimeout(res, 100)));

describe('Auth API', () => {
  it('logs in seeded user', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'caregiver', password: 'test' });
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('caregiver');
  });
});

describe('Therapy logs API', () => {
  it('creates and lists logs', async () => {
    const login = await request(app)
      .post('/api/login')
      .send({ username: 'caregiver', password: 'test' });
    const userId = login.body.id;

    await request(app)
      .post('/api/therapy_logs')
      .send({ user_id: userId, text: 'test log' })
      .expect(200);

    const logs = await request(app).get('/api/therapy_logs');
    const hasLog = logs.body.some((l) => l.text === 'test log');
    expect(hasLog).toBe(true);
  });
});

import request from 'supertest';
import app from '../server';
import server from '../startServer';
import createDatabaseConnection from '../database';


// Mock the createDatabaseConnection function
jest.mock('../database', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    pool: {
      connect: jest.fn().mockResolvedValue({
      }),
    },
    query: jest.fn().mockReturnValueOnce({ rows: [{ id: 1, name: 'Test Row' }] })
    .mockRejectedValueOnce(new Error('Database query error'))
    .mockReturnValueOnce({ rows: [{ id: 1, name: 'Test Row' }] }),
  })),
}));



// Mock the requireAuth middleware
jest.mock('../middlewares/requireAuth', () => {
  return jest.fn((req, res, next) => {
    req.user = { id: 1, username: 'testuser' }; // Mock authenticated user
    next();
  });
});


describe('API Tests', () => {
  let mockConnection;

  beforeEach(() => {
    mockConnection = require('../database').default();
  });

  afterEach(() => {
    jest.clearAllMocks();
    server.close();
  });

  it('should return rows from the Test table for /testdb', async () => {
    const mockRows = [{ id: 1, name: 'Test Row' }];

    const response = await request(app).get('/testdb');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRows);
  });

  it('should return 500 if there is a database error for /testdb', async () => {
    mockConnection.query.mockRejectedValueOnce(new Error('Database query error'));

    const response = await request(app).get('/testdb');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal Server Error');
  });

  it('should return a logged in message for /dashboard', async () => {
    const response = await request(app).get('/dashboard');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'LoggedIn' });
  });
});
import request from 'supertest';
import express from 'express';
import membershipRoutes from '../membership.routes';

const app = express();
app.use(express.json());
app.use('/memberships', membershipRoutes);

describe('Membership API Endpoints', () => {
  it('should create a new membership with valid data', async () => {
    const newMembershipData = {
      name: 'Test Membership',
      recurringPrice: 75,
      billingInterval: 'monthly',
      billingPeriods: 8,
    };

    const response = await request(app)
      .post('/memberships')
      .send(newMembershipData);

    expect(response.status).toBe(201);
    expect(response.body.membership).toBeDefined();
    expect(response.body.membership.name).toBe(newMembershipData.name);
  });

  it('should return an error for missing name', async () => {
    const invalidData = {
      recurringPrice: 50,
      billingInterval: 'monthly',
      billingPeriods: 6,
    };

    const response = await request(app)
      .post('/memberships')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('missingMandatoryFields');
  });

  it('should get all memberships', async () => {
    const response = await request(app).get('/memberships');

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.length).toBeGreaterThan(0);
  });
});

import {userData} from './utils';

const {req} = require('./utils');

describe('Users routes', () => {
  it('GET users', async () => {
    const res = await req
      .get('/api/Users')
      .set({authorization: userData.token});

    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('_id');
    expect(res.body[0]).toHaveProperty('fullName');
    expect(res.body[0]).toHaveProperty('socketId');
    expect(res.body[0]).toHaveProperty('updatedAt');
  });
});

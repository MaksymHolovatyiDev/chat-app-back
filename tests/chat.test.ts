import {userData} from './utils';

const {req} = require('./utils');

let ChatId: any;

describe('Chat routes success', () => {
  it('POST create chat', async () => {
    const res = await req
      .post('/api/Chat/create')
      .set({authorization: userData.token})
      .send({chatUsersId: [userData.id], chatName: 'test'});

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });

  it('GET all chats', async () => {
    const res = await req.get('/api/Chat').set({authorization: userData.token});

    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('_id');
    expect(res.body[0]).toHaveProperty('unreadMessages');
    expect(res.body[0]).toHaveProperty('chatName');
    expect(res.body[0]).toHaveProperty('chatMessage');
    expect(res.body[0]).toHaveProperty('users');
    ChatId = res.body[0]._id;
  });

  it('GET chat', async () => {
    const res = await req
      .get('/api/Chat/' + ChatId)
      .set({authorization: userData.token});

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('messages');
    expect(res.body).toHaveProperty('users');
  });

  it('POST send message', async () => {
    const res = await req
      .post('/api/Chat')
      .set({authorization: userData.token})
      .send({message: 'abc', ChatId, reply: []});

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('messages');
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('chatName');
  });

  it('GET find by message', async () => {
    const res = await req
      .get('/api/Chat/message/abc')
      .set({authorization: userData.token});

    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('_id');
    expect(res.body[0]).toHaveProperty('chatId');
    expect(res.body[0]).toHaveProperty('text');
    expect(res.body[0]).toHaveProperty('createdAt');
    expect(res.body[0]).toHaveProperty('owner');
  });
});

describe('Chat routes error', () => {
  it('POST send message error', async () => {
    const res = await req
      .post('/api/Chat')
      .set({authorization: userData.token})
      .send({message: 'abc', ChatId: '99952e0259b09b2ded759979', reply: []});

    expect(res.statusCode).toBe(400);
  });
});

require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const {Tcp} = require('../src/infra/Tcp');

const TCP = new Tcp();

const server = TCP.getServer();

export const req = request(server);

beforeEach(async () => {
  await mongoose.connect(process.env.DB_TEST);
});

afterEach(async () => {
  await mongoose.connection.close();
});

export const userData = {
  id: '6525240c996dbb5a1b2f1a80',
  token:
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MjUyNDBjOTk2ZGJiNWExYjJmMWE4MCIsImlhdCI6MTY5NjkzNDEwMn0.HdNGLGvBfQDeZI9TjABa0bJoOr4-DdDCycM2vzzBcf4',
};

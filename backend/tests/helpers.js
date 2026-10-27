const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");

const PASSWORD = "losenord123";

async function createUser(email) {
  const register = await request(app)
    .post("/api/auth/register")
    .send({ email, password: PASSWORD });
  if (register.status !== 201) {
    throw new Error(`Kunde inte registrera ${email}: ${register.status}`);
  }
  const login = await request(app)
    .post("/api/auth/login")
    .send({ email, password: PASSWORD });
  if (login.status !== 200) {
    throw new Error(`Kunde inte logga in ${email}: ${login.status}`);
  }
  return {
    userId: register.body.user.id,
    token: login.body.token,
    auth: { Authorization: `Bearer ${login.body.token}` }
  };
}

async function createTitle(user, overrides = {}) {
  const data = {
    name: "Breaking Bad",
    kind: "series",
    genre: "Drama",
    status: "unwatched",
    runtimeMinutes: 45,
    ...overrides
  };
  const res = await request(app)
    .post("/api/titles")
    .set(user.auth)
    .send(data);
  if (res.status !== 201) {
    throw new Error(`Kunde inte skapa titel: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.title;
}

async function cleanDatabase() {
  await prisma.title.deleteMany({});
  await prisma.user.deleteMany({});
}

module.exports = { app, prisma, createUser, createTitle, cleanDatabase, PASSWORD };

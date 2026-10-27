const request = require("supertest");
const { app, prisma, createUser, cleanDatabase, PASSWORD } = require("./helpers");

beforeEach(cleanDatabase);

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  test("skapar en användare och returnerar aldrig lösenordet", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "nya@serieapp.se", password: PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: "nya@serieapp.se" });
    expect(res.body.user).not.toHaveProperty("passwordHash");

    const saved = await prisma.user.findUnique({ where: { email: "nya@serieapp.se" } });
    expect(saved).toBeTruthy();
    expect(saved.passwordHash).not.toBe(PASSWORD);
    expect(saved.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  test("avslår dubblett med 409", async () => {
    await request(app).post("/api/auth/register").send({ email: "nya@serieapp.se", password: PASSWORD });
    const res = await request(app).post("/api/auth/register").send({ email: "nya@serieapp.se", password: PASSWORD });
    expect(res.status).toBe(409);
  });

  test("avslår ogiltig e-post och för kort lösenord med 400", async () => {
    const badEmail = await request(app).post("/api/auth/register").send({ email: "inte-en-mail", password: PASSWORD });
    expect(badEmail.status).toBe(400);

    const shortPassword = await request(app).post("/api/auth/register").send({ email: "nya@serieapp.se", password: "kort" });
    expect(shortPassword.status).toBe(400);
  });

  test("avslår saknad body med 400", async () => {
    const res = await request(app).post("/api/auth/register");
    expect(res.status).toBe(400);
  });

  test("avslår ogiltig JSON med 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send("{ogiltig");
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  test("loggar in med rätt lösenord och returnerar token", async () => {
    await request(app).post("/api/auth/register").send({ email: "nya@serieapp.se", password: PASSWORD });
    const res = await request(app).post("/api/auth/login").send({ email: "nya@serieapp.se", password: PASSWORD });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user).toMatchObject({ email: "nya@serieapp.se" });
    expect(res.body.user).not.toHaveProperty("passwordHash");
  });

  test("avslår fel lösenord med 401", async () => {
    await request(app).post("/api/auth/register").send({ email: "nya@serieapp.se", password: PASSWORD });
    const res = await request(app).post("/api/auth/login").send({ email: "nya@serieapp.se", password: "felllosenord1" });
    expect(res.status).toBe(401);
  });

  test("avslår okänd e-post med 401", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "okand@serieapp.se", password: PASSWORD });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  test("returnerar inloggad användare", async () => {
    const user = await createUser("nya@serieapp.se");
    const res = await request(app).get("/api/auth/me").set(user.auth);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: "nya@serieapp.se" });
  });

  test("avslår utan token med 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

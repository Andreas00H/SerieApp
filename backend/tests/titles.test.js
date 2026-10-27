const request = require("supertest");
const { app, prisma, createUser, createTitle, cleanDatabase } = require("./helpers");

beforeEach(cleanDatabase);

afterAll(async () => {
  await prisma.$disconnect();
});

describe("autentisering för /api/titles", () => {
  test("avslår GET listan utan token med 401", async () => {
    const res = await request(app).get("/api/titles");
    expect(res.status).toBe(401);
  });

  test("avslår POST utan token med 401", async () => {
    const res = await request(app).post("/api/titles").send({ name: "Test", kind: "movie" });
    expect(res.status).toBe(401);
  });

  test("avslår PUT utan token med 401", async () => {
    const res = await request(app).put("/api/titles/1").send({ name: "Test", kind: "movie" });
    expect(res.status).toBe(401);
  });

  test("avslår DELETE utan token med 401", async () => {
    const res = await request(app).delete("/api/titles/1");
    expect(res.status).toBe(401);
  });

  test("avslår ogiltig token med 401", async () => {
    const res = await request(app)
      .get("/api/titles")
      .set("Authorization", "Bearer inte-en-jwt");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/titles", () => {
  test("skapar en titel med 201", async () => {
    const user = await createUser("nya@serieapp.se");
    const res = await request(app)
      .post("/api/titles")
      .set(user.auth)
      .send({ name: "Breaking Bad", kind: "series", genre: "Drama", runtimeMinutes: 45 });

    expect(res.status).toBe(201);
    expect(res.body.title).toMatchObject({
      name: "Breaking Bad",
      kind: "series",
      genre: "Drama",
      status: "unwatched",
      runtimeMinutes: 45,
      userId: user.userId
    });
  });

  test("avslår saknat namn med 400", async () => {
    const user = await createUser("nya@serieapp.se");
    const res = await request(app).post("/api/titles").set(user.auth).send({ kind: "movie" });
    expect(res.status).toBe(400);
  });

  test("avslår ogiltig kind med 400", async () => {
    const user = await createUser("nya@serieapp.se");
    const res = await request(app).post("/api/titles").set(user.auth).send({ name: "Test", kind: "bok" });
    expect(res.status).toBe(400);
  });

  test("avslår negativ speltid med 400", async () => {
    const user = await createUser("nya@serieapp.se");
    const res = await request(app)
      .post("/api/titles")
      .set(user.auth)
      .send({ name: "Test", kind: "movie", runtimeMinutes: -5 });
    expect(res.status).toBe(400);
  });
});

describe("läsa och ändra titlar", () => {
  test("listar bara den inloggade användarens titlar", async () => {
    const userA = await createUser("a@serieapp.se");
    const userB = await createUser("b@serieapp.se");
    await createTitle(userA, { name: "A:s film", kind: "movie" });
    await createTitle(userB, { name: "B:s film", kind: "movie" });

    const res = await request(app).get("/api/titles").set(userA.auth);
    expect(res.status).toBe(200);
    expect(res.body.titles).toHaveLength(1);
    expect(res.body.titles[0].name).toBe("A:s film");
  });

  test("hämtar en egen titel med 200", async () => {
    const user = await createUser("nya@serieapp.se");
    const title = await createTitle(user);
    const res = await request(app).get(`/api/titles/${title.id}`).set(user.auth);
    expect(res.status).toBe(200);
    expect(res.body.title.name).toBe("Breaking Bad");
  });

  test("uppdaterar en egen titel med 200", async () => {
    const user = await createUser("nya@serieapp.se");
    const title = await createTitle(user);
    const res = await request(app)
      .put(`/api/titles/${title.id}`)
      .set(user.auth)
      .send({ name: "Breaking Bad", kind: "series", status: "watched" });

    expect(res.status).toBe(200);
    expect(res.body.title.status).toBe("watched");
  });

  test("tar bort en egen titel med 204 och den försvinner", async () => {
    const user = await createUser("nya@serieapp.se");
    const title = await createTitle(user);
    const del = await request(app).delete(`/api/titles/${title.id}`).set(user.auth);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/titles/${title.id}`).set(user.auth);
    expect(get.status).toBe(404);
  });
});

describe("behörighet mellan användare", () => {
  test("blockerar GET, PUT och DELETE på annans titel med 404", async () => {
    const userA = await createUser("a@serieapp.se");
    const userB = await createUser("b@serieapp.se");
    const title = await createTitle(userA);

    const get = await request(app).get(`/api/titles/${title.id}`).set(userB.auth);
    expect(get.status).toBe(404);

    const put = await request(app)
      .put(`/api/titles/${title.id}`)
      .set(userB.auth)
      .send({ name: "Hacket", kind: "movie" });
    expect(put.status).toBe(404);

    const del = await request(app).delete(`/api/titles/${title.id}`).set(userB.auth);
    expect(del.status).toBe(404);

    const still = await prisma.title.findUnique({ where: { id: title.id } });
    expect(still.name).toBe("Breaking Bad");
  });
});

describe("GET /api/titles/random", () => {
  test("returnerar en slumpad titel från användarens lista", async () => {
    const user = await createUser("nya@serieapp.se");
    await createTitle(user, { name: "Film 1", kind: "movie" });
    await createTitle(user, { name: "Film 2", kind: "movie", genre: "Komedi" });

    const res = await request(app).get("/api/titles/random").set(user.auth);
    expect(res.status).toBe(200);
    expect(["Film 1", "Film 2"]).toContain(res.body.title.name);
  });

  test("returnerar aldrig en annan användares titel", async () => {
    const userA = await createUser("a@serieapp.se");
    const userB = await createUser("b@serieapp.se");
    await createTitle(userB, { name: "B:s hemliga film", kind: "movie" });

    const res = await request(app).get("/api/titles/random").set(userA.auth);
    expect(res.status).toBe(404);
  });

  test("filtrerar på genre", async () => {
    const user = await createUser("nya@serieapp.se");
    await createTitle(user, { name: "Drama", kind: "movie", genre: "Drama" });
    await createTitle(user, { name: "Komedi", kind: "movie", genre: "Komedi" });

    const res = await request(app).get("/api/titles/random?genre=drama").set(user.auth);
    expect(res.status).toBe(200);
    expect(res.body.title.genre.toLowerCase()).toContain("drama");
  });

  test("filtrerar på max speltid", async () => {
    const user = await createUser("nya@serieapp.se");
    await createTitle(user, { name: "Kort film", kind: "movie", runtimeMinutes: 90 });
    await createTitle(user, { name: "Lång film", kind: "movie", runtimeMinutes: 200 });

    const res = await request(app).get("/api/titles/random?maxRuntime=120").set(user.auth);
    expect(res.status).toBe(200);
    expect(res.body.title.name).toBe("Kort film");
  });

  test("avslår ogiltiga filter med 400", async () => {
    const user = await createUser("nya@serieapp.se");
    const res = await request(app).get("/api/titles/random?maxRuntime=abc").set(user.auth);
    expect(res.status).toBe(400);
  });

  test("hoppar över titlar utan speltid när maxRuntime sätts", async () => {
    const user = await createUser("nya@serieapp.se");
    await createTitle(user, { name: "Utan speltid", kind: "movie", runtimeMinutes: undefined });

    const res = await request(app).get("/api/titles/random?maxRuntime=120").set(user.auth);
    expect(res.status).toBe(404);
  });
});

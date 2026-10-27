const router = require("express").Router();
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

const titleSchema = z.object({
  name: z.string({ required_error: "Name is required" }).trim().min(1, "Namn krävs").max(120, "Name must be at most 120 characters"),
  kind: z.enum(["movie", "series"], {
    errorMap: () => ({ message: "Kind must be movie or series" })
  }),
  genre: z.string().trim().max(60, "Genre must be at most 60 characters").optional(),
  status: z.enum(["unwatched", "watching", "watched"], {
    errorMap: () => ({ message: "Status must be unwatched, watching or watched" })
  }).default("unwatched"),
  runtimeMinutes: z.coerce
    .number()
    .int("Runtime must be an integer")
    .positive("Runtime must be positive")
    .max(6000, "Runtime is unreasonably long")
    .optional(),
  externalId: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url("Invalid image URL").optional()
});

function firstIssue(parsed) {
  return parsed.error.issues[0].message;
}

router.get("/", async (req, res, next) => {
  try {
    const titles = await prisma.title.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" }
    });
    res.json({ titles });
  } catch (err) {
    next(err);
  }
});

router.get("/random", async (req, res, next) => {
  try {
    const querySchema = z.object({
      genre: z.string().trim().min(1).max(60).optional(),
      maxRuntime: z.coerce.number().int().positive().max(6000).optional()
    });
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: firstIssue(parsed) });
    }
    const where = { userId: req.userId };
    if (parsed.data.genre) {
      where.genre = { contains: parsed.data.genre, mode: "insensitive" };
    }
    if (parsed.data.maxRuntime) {
      where.runtimeMinutes = { lte: parsed.data.maxRuntime };
    }
    const matches = await prisma.title.findMany({ where });
    if (matches.length === 0) {
      return res.status(404).json({ error: "No titles match these filters" });
    }
    const title = matches[Math.floor(Math.random() * matches.length)];
    res.json({ title });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = titleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: firstIssue(parsed) });
    }
    const title = await prisma.title.create({
      data: { ...parsed.data, userId: req.userId }
    });
    res.status(201).json({ title });
  } catch (err) {
    next(err);
  }
});

async function findOwnedTitle(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return prisma.title.findFirst({
    where: { id, userId: req.userId }
  });
}

router.get("/:id", async (req, res, next) => {
  try {
    const title = await findOwnedTitle(req);
    if (!title) {
      return res.status(404).json({ error: "Title not found" });
    }
    res.json({ title });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = await findOwnedTitle(req);
    if (!existing) {
      return res.status(404).json({ error: "Title not found" });
    }
    const parsed = titleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: firstIssue(parsed) });
    }
    const title = await prisma.title.update({
      where: { id: existing.id },
      data: parsed.data
    });
    res.json({ title });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await findOwnedTitle(req);
    if (!existing) {
      return res.status(404).json({ error: "Title not found" });
    }
    await prisma.title.delete({ where: { id: existing.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;

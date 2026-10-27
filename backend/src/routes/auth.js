const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const config = require("../config");

const credentialsSchema = z.object({
  email: z
    .string({ required_error: "E-post krävs" })
    .trim()
    .toLowerCase()
    .email("Ogiltig e-postadress"),
  password: z
    .string({ required_error: "Lösenord krävs" })
    .min(8, "Lösenordet måste vara minst 8 tecken")
    .max(72, "Lösenordet får vara högst 72 tecken")
});

router.post("/register", async (req, res, next) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "E-postadressen är redan registrerad" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(401).json({ error: "Fel e-post eller lösenord" });
    }
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Fel e-post eller lösenord" });
    }
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", require("../middleware/auth").authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true }
    });
    if (!user) {
      return res.status(401).json({ error: "Ogiltig eller utgången session" });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

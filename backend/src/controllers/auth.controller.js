const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../config/db");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const { formatUser } = require("../utils/helpers");

// ─── Register ─────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Validate
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check existing
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ error: "Email already in use" });
      }
      return res.status(409).json({ error: "Username already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        displayName: displayName || username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    res.status(201).json({
      message: "Account created successfully",
      accessToken,
      refreshToken,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(404).json({ error: "Email does not exist" });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Refresh Token ─────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Check in DB
    const stored = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ error: "Refresh token expired or not found" });
    }

    // Issue new access token
    const newAccessToken = generateAccessToken(decoded.userId);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};

// ─── Logout ───────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await prisma.refreshToken
        .deleteMany({ where: { token } })
        .catch(() => {});
    }

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

// ─── Get Current User ─────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is set by protect middleware
  res.json({ user: req.user });
};

module.exports = { register, login, refreshToken, logout, getMe };

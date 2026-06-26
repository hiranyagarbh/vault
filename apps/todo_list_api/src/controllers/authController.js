import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, getUserByEmail, createSession, getSession, deleteSession } from "../models/user.js";
import { validateRegister, validateLogin } from "../utils/validation.js";

export async function registerUser(req, res) {
    const { name, email, password } = req.body;
    const error = validateRegister(name, email, password);
    if (error) { return res.status(400).json({ message: error.error }); }

    const existingUser = await getUserByEmail(email);
    if (existingUser) { return res.status(409).json({ message: "User already exists" }); }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hashedPassword);

    const access_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refresh_token = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000);

    const session = await createSession(user.id, refresh_token, expires_at);

    res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7 * 1000
    });
    return res.status(201).json({ access_token });
}

export async function loginUser(req, res) {
    const { email, password } = req.body;
    const error = validateLogin(email, password);
    if (error) { return res.status(400).json({ message: error.error }); }

    const user = await getUserByEmail(email);
    if (!user) { return res.status(401).json({ message: "Invalid credentials" }); }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) { return res.status(401).json({ message: "Invalid credentials" }); }

    const access_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refresh_token = crypto.randomUUID();

    const expires_at = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000);
    const session = await createSession(user.id, refresh_token, expires_at);
    res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7 * 1000
    });
    return res.status(200).json({ access_token });
}

export async function refreshAccessToken(req, res) {
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token) { return res.status(401).json({ message: "Refresh token not found" }); }

    const session = await getSession(refresh_token);
    if (!session) { return res.status(401).json({ message: "Invalid session" }); }

    if (session.expires_at < Date.now()) { return res.status(401).json({ message: "Session expired" }); }

    const access_token = jwt.sign({ id: session.user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({ access_token });
}

export async function logoutUser(req, res) {
    const { refresh_token } = req.cookies;
    if (!refresh_token) { return res.status(401).json({ message: "Refresh token not found" }); }

    const session = await getSession(refresh_token);
    if (!session) { return res.status(401).json({ message: "Invalid session" }); }

    await deleteSession(refresh_token);
    res.clearCookie("refresh_token");
    res.clearCookie("access_token");

    return res.status(200).json({ message: "Logout successful" });
}
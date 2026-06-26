import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, getUserByEmail } from "../models/user.js";

export async function registerUser(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) { return res.status(400).json({ message: "All fields are required" }); }
    const existingUser = await getUserByEmail(email);
    if (existingUser) { return res.status(409).json({ message: "User already exists" }); }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hashedPassword);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.status(201).json({ token });
}

export async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) { return res.status(400).json({ message: "All fields are required" }); }
    const user = await getUserByEmail(email);
    if (!user) { return res.status(401).json({ message: "Invalid credentials" }); }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) { return res.status(401).json({ message: "Invalid credentials" }); }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.status(200).json({ token });
}
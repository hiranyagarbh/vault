import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, getUserByEmail } from "../models/user.js";
import { validateRegister, validateLogin } from "../utils/validation.js";

export async function registerUser(req, res) {
    const { name, email, password } = req.body;
    const error = validateRegister(name, email, password);
    if (error) { return res.status(400).json({ message: error.error }); }
    const existingUser = await getUserByEmail(email);
    if (existingUser) { return res.status(409).json({ message: "User already exists" }); }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hashedPassword);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.status(201).json({ token });
}

export async function loginUser(req, res) {
    const { email, password } = req.body;
    const error = validateLogin(email, password);
    if (error) { return res.status(400).json({ message: error.error }); }
    const user = await getUserByEmail(email);
    if (!user) { return res.status(401).json({ message: "Invalid credentials" }); }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) { return res.status(401).json({ message: "Invalid credentials" }); }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.status(200).json({ token });
}
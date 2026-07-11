import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) { return res.status(401).json({ message: "Unauthorized" }); }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Error authenticating user:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
}
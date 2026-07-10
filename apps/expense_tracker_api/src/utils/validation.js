function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        return { error: "Invalid email. Email is required and must be a valid email address" };
    }
    return null;
}
function validatePassword(password) {
    if (!password || typeof password !== "string" || password.length < 8) {
        return { error: "Invalid password. Password must be at least 8 characters long" };
    }
    return null;
}
export function validateExpenseData(description, amount, category, date) {
    if (!description || typeof description !== "string") { return { error: "Invalid description" }; }
    if (!amount || typeof amount !== "number") { return { error: "Invalid Amount" }; }
    if (!category || typeof category !== "string") { return { error: "Invalid Category" }; }
    if (!date || typeof date !== "string") { return { error: "Invalid Date" }; }
    return null;
}
export function validateRegister(name, email, password) {
    if (!name || typeof name !== "string") { return { error: "Invalid name" }; }
    const emailError = validateEmail(email);
    if (emailError) { return emailError; }
    const passwordError = validatePassword(password);
    if (passwordError) { return passwordError; }
    return null;
}

export function validateLogin(email, password) {
    const emailError = validateEmail(email);
    if (emailError) { return emailError; }
    const passwordError = validatePassword(password);
    if (passwordError) { return passwordError; }
    return null;
}

export function validatePagination(page, limit) {
    if ((page && typeof page !== "number") || (limit && typeof limit !== "number")) {
        return { error: "Invalid data" };
    }
    if ((page && page <= 0) || (limit && limit <= 0)) {
        return { error: "Invalid data" };
    }
    return null;
}
export function validateId(id, userId) {
    if (!id || !userId || typeof id !== "number" || typeof userId !== "number") { return { error: "Invalid data" }; }
    if (id <= 0 || userId <= 0) { return { error: "Invalid data" }; }
    return null;
}
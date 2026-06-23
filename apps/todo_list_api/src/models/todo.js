function validateTodo(todo) {
    if (!todo.userId || typeof todo.userId !== "number") { return { error: "Invalid data" }; }
    if (!todo.title || typeof todo.title !== "string") { return { error: "Invalid data" }; }
    if (todo.description && typeof todo.description !== "string") { return { error: "Invalid data" }; }
    return null;
}
function validatePagination(page, limit) {
    if (!page || !limit || typeof page !== "number" || typeof limit !== "number") { return { error: "Invalid data" }; }
    return null;
}
function validateId(id, userId) {
    if (!id || !userId || typeof id !== "number" || typeof userId !== "number") { return { error: "Invalid data" }; }
    return null;
}

export function createTodo(userId, title, description) {
    const error = validateTodo({ userId, title, description });
    if (error) { return error; }
    const query = "INSERT INTO todos (user_id, title, description) VALUES ($1, $2, $3) RETURNING *";
    const values = [userId, title, description];
    return { query, values };
}

export function getAllTodos(userId, page, limit) {
    const paginationError = validatePagination(page, limit);
    if (paginationError) { return paginationError; }
    if (!userId) { return { error: "Invalid data" }; }
    const query = "SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3";
    const values = [userId, limit, (page - 1) * limit];
    return { query, values };
}

export function getTodoById(userId, id) {
    const error = validateId(id, userId);
    if (error) { return error; }
    const query = "SELECT * FROM todos WHERE user_id = $1 AND id = $2";
    const values = [userId, id];
    return { query, values };
}

export function updateTodo(userId, id, title, description) {
    const error = validateId(id, userId);
    if (error) { return error; }
    const query = "UPDATE todos SET title = $1, description = $2, updated_at = NOW() WHERE user_id = $3 AND id = $4 RETURNING *;";
    const values = [title, description, userId, id];
    return { query, values };
}

export function deleteTodo(userId, id) {
    const error = validateId(id, userId);
    if (error) { return error; }
    const query = "DELETE FROM todos WHERE user_id = $1 AND id = $2 RETURNING *;";
    const values = [userId, id];
    return { query, values };
}
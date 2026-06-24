import { createTodo, getAllTodos, getTodoById, updateTodo, deleteTodo } from "../models/todo.js";

export function createTodoHandler(req, res) {
    const { userId, title, description } = req.body;
    const result = createTodo(userId, title, description);
    if (result.error) {
        return res.status(400).json(result);
    }
    const { query, values } = result;
    return { query, values };
}

export function getAllTodosHandler(req, res) {
    const { userId, page, limit } = req.body;
    const result = getAllTodos(userId, page, limit);
    if (result.error) {
        return res.status(400).json(result);
    }
    const { query, values } = result;
    return { query, values };
}

export function getTodoByIdHandler(req, res) {
    const { userId, id } = req.body;
    const result = getTodoById(userId, id);
    if (result.error) {
        return res.status(400).json(result);
    }
    const { query, values } = result;
    return { query, values };
}

export function updateTodoHandler(req, res) {
    const { userId, id, title, description } = req.body;
    const result = updateTodo(userId, id, title, description);
    if (result.error) {
        return res.status(400).json(result);
    }
    const { query, values } = result;
    return { query, values };
}

export function deleteTodoHandler(req, res) {
    const { userId, id } = req.body;
    const result = deleteTodo(userId, id);
    if (result.error) {
        return res.status(400).json(result);
    }
    const { query, values } = result;
    return { query, values };
}
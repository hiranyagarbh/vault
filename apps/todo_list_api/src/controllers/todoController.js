import { createTodo, getAllTodos, getTodoById, updateTodo, deleteTodo, getTotalTodos } from "../models/todo.js";
import { validateTodo, validatePagination, validateId } from "../utils/validation.js";
export async function createTodoHandler(req, res) {
    const { id: userId } = req.user;
    const { title, description } = req.body;
    const error = validateTodo(title, description);
    if (error) { return res.status(400).json({ message: error.error }); }
    const result = await createTodo(userId, title, description);
    return res.status(201).json(result);
}

export async function getAllTodosHandler(req, res) {
    const { id: userId } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const error = validatePagination(Number(page), Number(limit));
    if (error) { return res.status(400).json({ message: error.error }); }
    const result = await getAllTodos(userId, Number(page), Number(limit));
    if (!result.length) { return res.status(404).json({ error: "No todos found" }); }
    const totalTodos = await getTotalTodos(userId);
    return res.status(200).json({
        data: result,
        page: Number(page),
        limit: Number(limit),
        total: totalTodos
    });
}

export async function getTodoByIdHandler(req, res) {
    const { id: userId } = req.user;
    const { id } = req.params;
    const error = validateId(Number(id), Number(userId));
    if (error) { return res.status(400).json({ message: error.error }); }
    const result = await getTodoById(userId, Number(id));
    if (!result) { return res.status(404).json({ error: "Todo not found" }); }
    return res.status(200).json(result);
}

export async function updateTodoHandler(req, res) {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { title, description } = req.body;
    const errorId = validateId(Number(id), Number(userId))
    if (errorId) { return res.status(400).json({ message: errorId.error }); }
    const errorTodo = validateTodo(title, description);
    if (errorTodo) { return res.status(400).json({ message: errorTodo.error }); }
    const result = await updateTodo(userId, Number(id), title, description);
    if (!result) { return res.status(404).json({ error: "Todo not updated" }); }
    return res.status(200).json(result);
}

export async function deleteTodoHandler(req, res) {
    const { id: userId } = req.user;
    const { id } = req.params;
    const error = validateId(Number(id), Number(userId));
    if (error) { return res.status(400).json({ message: error.error }); }
    const result = await deleteTodo(userId, Number(id));
    if (!result) { return res.status(404).json({ error: "Todo not deleted" }); }
    return res.status(204).end();
}
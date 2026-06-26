import { createTodo, getAllTodos, getTodoById, updateTodo, deleteTodo } from "../models/todo.js";

export async function createTodoHandler(req, res) {
    const { id: userId } = req.user;
    const { title, description } = req.body;
    const result = await createTodo(userId, title, description);
    if (result.error) { return res.status(400).json(result); }
    return res.status(201).json(result);
}

export async function getAllTodosHandler(req, res) {
    const { id: userId } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllTodos(userId, Number(page), Number(limit));
    if (!result.length) { return res.status(404).json({ error: "No todos found" }); }
    if (result.error) { return res.status(400).json(result); }
    return res.status(200).json({
        data: result,
        page: Number(page),
        limit: Number(limit),
        total: result.length
    });
}

export async function getTodoByIdHandler(req, res) {
    const { id: userId } = req.user;
    const { id } = req.params;
    const result = await getTodoById(userId, Number(id));
    if (!result) { return res.status(404).json({ error: "Todo not found" }); }
    if (result.error) { return res.status(400).json(result); }
    return res.status(200).json(result);
}

export async function updateTodoHandler(req, res) {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { title, description } = req.body;
    const result = await updateTodo(userId, Number(id), title, description);
    if (!result) { return res.status(404).json({ error: "Todo not updated" }); }
    if (result.error) { return res.status(400).json(result); }
    return res.status(200).json(result);
}

export async function deleteTodoHandler(req, res) {
    const { id: userId } = req.user;
    const { id } = req.params;
    const result = await deleteTodo(userId, Number(id));
    if (!result) { return res.status(404).json({ error: "Todo not deleted" }); }
    if (result.error) { return res.status(400).json(result); }
    return res.status(204).end();
}
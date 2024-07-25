const taskModel = require('../models/Taskmodel.js');

// Get all tasks
const getAllTasks = async (req, res) => {
    try {
        const tasks = await taskModel.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new task
const createTask = async (req, res) => {
    const task = new taskModel({
        name: req.body.name,
        description: req.body.description,
        date: req.body.date,
        time: req.body.time,
        tab: req.body.tab,
        location: req.body.location,
    });
    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a task
const updateTask = async (req, res) => {
    try {
        const updatedTask = await taskModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    try {
        await taskModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
};

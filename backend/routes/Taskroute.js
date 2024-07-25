const express = require('express');
const {getAllTasks}=require('../controllers/Taskcontroller.js');
const {createTask}=require('../controllers/Taskcontroller.js');
const {updateTask}=require('../controllers/Taskcontroller.js');
const {deleteTask}=require('../controllers/Taskcontroller.js');
    

const router = express.Router();

// Route to get all tasks
router.get('/gettasks', getAllTasks);

// Route to create a new task
router.post('/createtasks', createTask);

// Route to update a task by ID
router.put('/updatetasks/:id', updateTask);

// Route to delete a task by ID
router.delete('/deletetasks/:id', deleteTask);

module.exports = router;
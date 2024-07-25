const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    description: { type: String },
    date: { type: String },
    time: { type: String },
    tab: { type: String, required: true },
    location: { type: String },
});

const taskModel = mongoose.models.Task || mongoose.model('Task', taskSchema);

module.exports = taskModel;

const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect('mongodb+srv://chaitu_27:Chaitu2714@cluster0.rfjltue.mongodb.net/test')
    .then(() => console.log("DB connected"))
    .catch(err => console.log("DB connection error:", err));
};

module.exports = { connectDB };
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { userRouter } = require("./routes/Userroute.js");
const dotenv = require('dotenv');
const router = require('./routes/Taskroute.js');

dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// Connect to the database
connectDB();

app.use("/api/user", userRouter);
app.use("/api/task", router);

app.get("/", (req, res) => {
  res.send("API working");
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

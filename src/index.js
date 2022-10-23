const express = require("express");
require("./db/mongoose"); //just to load the file.. to connect the database.

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const Task = require("./models/task");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); //It will decode everything from json to js object
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log("server is running at port " + port);
});

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

// const router = new express.Router(); //creating new router
// router.get("/test", (req, res) => {
//   //set up those route
//   res.send("this is a Router");
// });
// app.use(router); // register it with the express application

app.listen(port, () => {
    console.log("server is running at port " + port);
});

const main = async () => {
    const task = await Task.findById("634ef7adb0c41d2f49cb4de3");
    const tt = await task.populate("owner");
    console.log(task.owner);
    console.log(tt);
};
//main();

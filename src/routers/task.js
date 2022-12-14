const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const { update } = require("../models/user");
const router = new express.Router();

//creating task
router.post("/tasks", auth, async (req, res) => {
    //const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

//reading all Task collection
// GET /tasks , /tasks?completed=true , /tasks?completed=false
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc , /tasks?sortBy=createdAt:asc
router.get("/tasks", auth, async (req, res) => {
    //const match = { owner: req.user._id };
    const match = {};
    const sort = {};
    if (req.query.completed) {
        match.completed = req.query.completed === "true"; //req.query.completed return in string, and we need completed value in bool.
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1; // 1 for ascending , -1 for descending
    }

    try {
        //const tasks = await Task.find(match);
        const user = await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            },
        });
        res.send(user.tasks);
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});

//reading a Task collection by id
router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

//updating task using patch method
router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates!" });
    }
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!task) {
            return res.status(400).send();
        }
        updates.forEach((update) => (task[update] = req.body[update]));
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

//deleting task
router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!task) {
            return res.status(400).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;

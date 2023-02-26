// add  middlewares
const handler = require("../Middleware/asyncHandler");
const auth = require("../Middleware/auth");
const myError = require("../Model/myError")

// create our router
const express = require("express");
const router = new express.Router();

// connect to user Model
const mongoose = require("mongoose");
const User = require("../Model/userSchema");
const Task = require("../Model/taskSchema");


//************************************************************************************** */
//Tasks part
//********************************************************************************************** */

// post task create new task
// ____________________________________________________________
router.post("/tasks", auth, handler(async (req, res) => {
    console.log(req.body)

    const task = new Task({
        ...req.body,
        creator: req.user._id
    })
    await task.save()
    res.status(200).send(task)

}))

// Show tasks by id
// ____________________________________________________________

router.get("/tasks/:id", auth, handler(async (req, res) => {

    const task = await Task.findOne({ _id: req.params.id, creator: req.user._id })
    if (!task) { throw new myError(404, `There is no task created by you`) }
    res.status(200).json(task)

}))

// Show all tasks 
// ____________________________________________________________

router.get("/tasks", auth, handler(async (req, res) => {
    let match = {};
    let sort = {}

    if (req.query.complete) {
        match.complete = req.query.complete === "true";
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === "des" ? -1 : 1
    }



    await req.user.populate({
        path: "tasks",
        match,
        options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
        }
    })
    res.status(200).json(req.user.tasks)

}))


// Delete a tasks 
// ____________________________________________________________
router.delete("/tasks/:id", auth, handler(async (req, res) => {

    await Task.deleteOne({ _id: req.params.id, creator: req.user._id })
    res.status(200).send("done")

}))

// **************************************************
// update task
// ____________________________________________________________

router.patch("/tasks/:id", auth, handler(async (req, res) => {

    if (req.body.creator && req.body.creator !== req.user._id) {
        throw new Error("cannot change the creator")
    }
    const task = await Task.findOneAndUpdate({ _id: req.params.id, creator: req.user._id }, req.body, { new: true, runValidators: true })
    if (!task) {
        throw new myError(404, "There is no task created by you")
    }
    res.status(200).json(task)

}))

module.exports = router;
const mongoose = require("mongoose")
// const express = require("express");
// const app = express()
const userSchema = require("./Model/userSchema")
const taskSchema = require("./Model/taskSchema")

// mongoose.set({ 'strictQuery': false, autoIndex: false });
// mongoose.connect("mongodb://127.0.0.1:27017/taskManger")
//     .then(() => console.log("application is ready"))
//     .catch((err) => console.log("unable to start application"))


const User = new mongoose.model("User", userSchema);
const Task = new mongoose.model("Task", taskSchema);

async function signUp(opject) {
    try {
        return await User.signUp(opject);
    } catch (error) {
        return error.message;
    }
};

async function logIn(opject) {
    try {
        return await User.logIn(opject.email, opject.password);
    } catch (error) {
        return error.message;
    }
}

async function creatTask(opject) {
    return await Task.createTask(opject)
    // const task = new Task({
    //     description: opject.description,
    //     complete: opject.complete,
    //     // creator: user._id
    //     creator: opject.creator
    // })
    // return await task.save();
}

async function findTask(id) {
    return await Task.findById(id)
}

async function editTask(id, opject) {
    return await Task.findByIdAndUpdate(id, opject, { new: true, runValidators: true })
}

async function userFind(id, opject) {
    return await User.find()
}



// module.exports = { signUp, creatTask, logIn, findTask, editTask, userFind }
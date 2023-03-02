const JWT = require("jsonwebtoken");
const mongoose = require("mongoose");


const User = require("../../src/Model/userSchema")
const Task = require("../../src/Model/taskSchema")

let UserOne = {
    _id: new mongoose.Types.ObjectId(),
    name: "User One",
    userName: "UserOne",
    email: "UserOne@jest.com",
    password: "UserOne$jest",
    tokens: {
        _id: new mongoose.Types.ObjectId(),
        token: JWT.sign({ id: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET)
    }
}
let UserOneDash = {
    _id: new mongoose.Types.ObjectId(),
    name: "User One",
    userName: "UserOneDash",
    email: "UserOneDash@jest.com",
    password: "UserOne$jest",
    tokens: {
        _id: new mongoose.Types.ObjectId(),
        token: JWT.sign({ id: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET)
    }
}

let comapreUserOne = {
    name: "User One",
    userName: "userone",
    email: "userone@jest.com",
}

let UserTwo = {
    _id: new mongoose.Types.ObjectId(),
    name: "User Two",
    userName: "usertwo",
    email: "usetwo@jest.com",
    password: "UserTwo$jest",
    tokens: {
        _id: new mongoose.Types.ObjectId(),
        token: JWT.sign({ id: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET)
    }
}
let TaskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: "task one description",
    complete: true,
    creator: UserOne._id
}
let TaskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: "task two description",
    complete: false,
    creator: UserOne._id
}
let TaskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: "task three description",
    complete: false,
    creator: UserTwo._id
}

async function setUpFn() {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(UserOne).save();
    await new User(UserOneDash).save();
    await new User(UserTwo).save();
    await new Task(TaskOne).save();
    await new Task(TaskTwo).save();
    await new Task(TaskThree).save();
}
module.exports = {
    UserOne,
    setUpFn,
    UserTwo,
    TaskOne,
    TaskTwo,
    TaskThree,
    comapreUserOne
}
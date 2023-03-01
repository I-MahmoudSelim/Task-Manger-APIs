const express = require("express");
const app = express();

require("./Database/mongoose");
const userRouters = require("./Routers/userRouter");
const taskRouters = require("./Routers/taskRouter");

//build body parser middelware to parse data 
app.use(express.json())
app.use(express.urlencoded({ "extended": false }));
app.use(userRouters);
app.use(taskRouters);

module.exports = app;
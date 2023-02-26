const path = require("path")
const publicPath = path.join(__dirname, "./public")



const express = require("express");
const app = express();

const mongoose = require("mongoose");
const userRouters = require("./Routers/userRouter");
const taskRouters = require("./Routers/taskRouter");

// Start Database server then Start our server 
const port = process.env.PORT;
const mongoDB_URI = process.env.MONGODB_URI;
app.set("views", path.join(__dirname, "./views"))

//build body parser middelware to parse data 
app.use(express.json())
app.use(express.urlencoded({ "extended": false }))
app.use(express.static(publicPath))    // setup static dirctory to server
app.use(userRouters);
app.use(taskRouters);
app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ error: err.message })
    } else {
        res.status(500).send({ error: err.message })
    }
})

app.get("", (req, res) => {
    res.send()
})
mongoose.set({ 'strictQuery': false, "autoIndex": false });
mongoose.connect(mongoDB_URI)
    .then(() => app.listen(port, () => console.log("application is ready", port)))
    .catch((err) => console.log("unable to start application", err))

// const multer = require("multer");
// const upload = multer({
//     storage: "uploads",
//     limits: {
//         fileSize: 1000000,
//     }, fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(doc|docx)$/)) {
//             cb(new Error("file must be word document"))
//         }
//         file.filename = "asd"
//         cb(undefined, true)
//     }
// })

// app.post("/upload", upload.single("upload"), (req, res) => {
//     res.send("done")
// })
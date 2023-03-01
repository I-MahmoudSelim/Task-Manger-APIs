// add authentcation middleware
const handler = require("../Middleware/asyncHandler");
const auth = require("../Middleware/auth");
// add helper functions
const { sendWelcomeEmail, sendCancelEmail } = require("../email/sendEmails")
const myError = require("../Model/myError")
// create our router
const express = require("express");
const router = new express.Router();

// connect to user Model
const mongoose = require("mongoose");
const User = require("../Model/userSchema");

// add multer & sharp package to uploads and modify avatars
const sharp = require("sharp")
const multer = require("multer");
const upload = multer({
    // dest: "image",// if it is deleted , multer will pass the file to memory
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new myError(400, "file must be picture(jpg,jepg,png)"))
        }
        cb(undefined, true)
    }
});

//************************************************************************************** */
//Users part
//********************************************************************************************** */

// signUp create new user document
// ____________________________________________________________
router.post("/users", handler(async (req, res) => {
    const user = await User.signUp(req.body);
    const token = await user.generateAuthToken()
    sendWelcomeEmail(req.body.email, req.body.name)
    res.status(201).send({ user, token })
}))

// Log In users
// ____________________________________________________________
router.post("/users/login", handler(async (req, res) => {

    const user = await User.logIn(req.body.email, req.body.password)
    // if (!user) {
    //     res.status(404).send("There is no user with this id")
    // }
    const token = await user.generateAuthToken()

    res.status(200).json({ user, token })

}))

// Log Out 
// _________________________________________________________
router.post("/users/logout", auth, handler(async (req, res) => {
    await User.logOut(req.user, req.token)
    res.status(200).send()
}))

// Log Out from other sessions 
// _________________________________________________________
router.post("/users/logoutall", auth, handler(async (req, res) => {

    await User.deleteOthersUsers(req.user, req.token)
    res.status(200).send()

}))

// Read Profile
// ____________________________________________________________
router.get("/users/me", auth, handler(async (req, res) => {
    res.status(200).send(req.user)
}))

//search user by property users
// ____________________________________________________________
router.get("/users/find", auth, handler(async (req, res) => {

    if (!req.query) {
        res.status(404).send("No query, no results.")
    }
    const data = await User.find(req.query)
    if (!data) {
        res.status(404).send(`There is no user with this ${req.query}`)
    }
    const newData = data.map((user) => {
        return user.toJSON();
    })
    res.status(200).send(newData)

}))

//show user by User name
// ____________________________________________________________
router.get("/users/:UN", auth, handler(async (req, res) => {
    const user = await User.findByUN(req.params.UN)
    if (!user) {
        res.status(404).send("There is no user with this id")
    }
    res.status(200).send(user)

}))

//************************************************************************************** */
// Edit user
// ____________________________________________________________
router.patch("/users/me", auth, handler(async (req, res) => {

    // const user = await User.findByIdAndUpdate(req.user.userName, req.body, { new: true, runValidators: true }))
    const updates = Object.keys(req.body)
    const mutables = ["userName", "name", "age", "email", "password"];
    const isValidated = updates.every(update => mutables.includes(update));
    if (!isValidated) {
        res.status(400).send("unaccepted updates")
    }
    if (updates.includes("email")) {
        req.user.isActivated = false;
        // 
        // send activation email
        // 
    }
    for (const update of updates) {
        req.user[update] = req.body[update];
    }
    await req.user.save();
    res.status(200).send(req.user)

}))


//************************************************************************************** */
// Delete our profile
// ____________________________________________________________
router.delete("/users/me", auth, handler(async (req, res) => {

    await User.findByIdAndDelete(req.user._id)
    // req.user.remove()
    sendCancelEmail(req.user.email, req.user.name);
    res.status(200).send()

}))

// POST router to upload profile avatar
// _________________________________________________________
router.post("/users/me/avatar", auth, upload.single("avatar"), handler(async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()
    req.user.avatar = buffer;
    await req.user.save()
    res.status(200).send(req.user)
}))

router.delete("/users/me/avatar", auth, upload.single("avatar"), handler(async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save()
    res.status(200).send(req.user)
}))

router.get("/users/:id/avatar", handler(async (req, res) => {
    const user = await User.findById(req.params.id)
    res.status(200).set("Content-Type", "image/jpg").send(user.avatar)
}))
module.exports = router;
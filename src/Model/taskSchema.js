const mongoose = require("mongoose");


const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    complete: {
        type: Boolean,
        default: false
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }
},
    {
        timestamps: true,
        statics: {

        },
        methods: {
            // toJSON:async function(){
            //     delete this.creator;
            //     return this;
            // }
        }
    })
module.exports = new mongoose.model("Task", taskSchema)
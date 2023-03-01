const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./taskSchema");
const myError = require("./myError");

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(e) {
            if (!validator.isEmail(e)) {
                throw new myError(403, "It is not valid e-mail")
            }
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(p) {
            if (p.toLowerCase().includes("password")) {
                throw new myError(403, "Your password cannot include 'password'")
            }
        }
    },
    age: {
        type: Number,
        default: 18,
        min: 18
    },
    isActivated: {
        type: Boolean,
        default: false,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar: Buffer,
}, {
    timestamps: true,
    statics: {
        signUp: async function (opject) {
            const user = new this(opject);
            return await user.save();
        },
        logIn: async function (email, password) {
            let user;

            if (validator.isEmail(email)) {
                user = await this.findOne({ email: email.toLowerCase() })
            } else {
                user = await this.findByUN(email.toLowerCase())
            }

            if (!user || !await bcrypt.compare(password, user.password)) {
                throw new myError(404, "wrong password or email")
            }
            return user;
        },
        logOut: async function (user, token) {
            user.tokens = user.tokens.filter((tokens) => {
                return tokens.token !== token;
            })
            await user.save()
        },
        deleteOthersUsers: async function (user, token) {
            user.tokens = user.tokens.filter((tokens) => {
                return tokens.token === token;
            })
            await user.save()
        },
        findByUN: async function (UN) {
            return await this.findOne({ userName: UN })
        }
    },
    methods: {
        toJSON() {
            let user = this.toObject()
            delete user.password;
            delete user.tokens;
            delete user._id;
            delete user.__v;
            delete user.avatar;
            return user
        },
        generateAuthToken: async function () {
            let user = this.toObject()
            delete user.password;
            delete user.tokens;
            delete user.__v;
            const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "2h" });
            this.tokens.push({ token });
            await this.save()
            return token;
        }, verifyToken(token) {
            return jwt.verify(token, "MahmoudSelim")
        },
    },
    // virtuals: {
    //     tasks: {
    //         // localField and foreignField options
    //         ref: 'Task',
    //         localField: '_id',
    //         foreignField: "creator"
    //     }
    // }
}
)
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: "creator"
})

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre("remove", async function (next) {
    await Task.deleteMany({ creator: this._id });
    next()
})

module.exports = new mongoose.model("User", userSchema);
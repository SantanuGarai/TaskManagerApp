const validator = require("validator");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = mongoose.Schema(
    {
        // mongodb convert model name into lowercase and pluralize it and store into db.
        // so "User" become 'users' , "Task" become 'tasks'
        name: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minLength: 6,
            validate(value) {
                if (value.toLowerCase().search("password") != -1) {
                    throw new Error("password can not contain 'password'");
                }
            },
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Please enter a valid email");
                }
            },
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error("age must be a positive number");
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer,
        },
    },
    {
        timestamps: true,
    }
);
userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner",
});
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET
    );
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Unable to Login!");
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Unable to Login!");
    }
    return user;
};

//using middleware we hash the plaintext password
userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcryptjs.hash(user.password, 8);
    }
    next();
});

//Delete user tasks when user is removed
userSchema.pre("remove", async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

// const me = new User({
//   name: "Santanu Garai",
//   password: "passWord 55",
//   email: "sana@gmail.com",
//   age: 22,
// });
// me.save() //save method saved the data that we store, and return a promise
//   .then(() => {
//     console.log(me);
//   })
//   .catch((error) => {
//     console.log("Error!", error);
//   });

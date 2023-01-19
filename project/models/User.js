const { mongoose } = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');


SALT_WORK_FACTOR = 10;


const userSchema = new mongoose.Schema({

    username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    password: { type: String, required: true },
    email: {
        address: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
        validated: {type: Boolean, default: false}
    },
    orders: {type: [mongoose.ObjectId], default: []},
    loggedIn: {type: Boolean, default: false}

},{
    timestamps:true
});

userSchema.plugin(uniqueValidator, {message: 'is already taken.'});

userSchema.pre("save", function(next) {
if(!this.isModified("password")) {
    return next();
}
this.password = bcrypt.hashSync(this.password, 10);
next();
});

userSchema.methods.comparePassword = function(plaintext) {
    return bcrypt.compareSync(plaintext, this.password);
};

module.exports = mongoose.model("User", userSchema);



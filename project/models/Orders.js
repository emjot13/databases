const { mongoose } = require("mongoose");

uniqueValidator = require('mongoose-unique-validator'),
bcrypt = require('bcrypt'),
SALT_WORK_FACTOR = 10;








const UserSchema = new mongoose.Schema({

    username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    password: { type: String, required: true },
    email: {    
        address: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
        validated: {type: Boolean, default: false}
    },
    orders: {type: [mongoose.ObjectId], default: []}

        
},{
    timestamps:true
});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.pre("save", function(next) {
if(!this.isModified("password")) {
    return next();
}
this.password = bcrypt.hashSync(this.password, 10);
next();
});

UserSchema.methods.comparePassword = function(plaintext, callback) {
return callback(null, bcrypt.compareSync(plaintext, this.password));
};

module.exports = mongoose.model("User", UserSchema);



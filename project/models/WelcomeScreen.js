const { mongoose } = require("mongoose");
require('mongoose-type-url');


const welcomeScreen = mongoose.Schema({
    advert: { type: String, default: "Welcome to the best cinema under the sun"},
    welcomePhoto: mongoose.SchemaTypes.Url,
    title: String

}, {timestamps: true});



module.exports = mongoose.model("welcomeScreen", welcomeScreen);



const { mongoose } = require("mongoose");
const Mongoose = require('mongoose').Mongoose;
const seancesCollection = new Mongoose();
seancesCollection.connect("mongodb://localhost:2000/seances", { useNewUrlParser: true })



const seanceSchema = seancesCollection.Schema({
    date: Date,
    movie: mongoose.ObjectId,
    room: Number


});

module.exports = seancesCollection.model("Seance", seanceSchema);
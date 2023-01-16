const { mongoose } = require("mongoose");

const itinerarySchema = mongoose.Schema({
    date: { type: Date, required: true },
    movies: { type: [Schema.Types.ObjectId]}

});

module.exports = mongoose.model("Itinerary", itinerarySchema);
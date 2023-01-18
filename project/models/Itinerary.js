const { mongoose } = require("mongoose");

const itinerarySchema = mongoose.Schema({
    // date: { type: Date, required: true },
    hours: { 
        type: Map,
        of: SchemaTypes.ObjectId
    }
    // movies: { type: [Schema.Types.ObjectId]}

});

module.exports = mongoose.model("Itinerary", itinerarySchema);
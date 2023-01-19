const { mongoose } = require("mongoose");


const seanceSchema = mongoose.Schema({
    date: Date,
    movie: mongoose.ObjectId,
    room: Number,
    ticketPrice: Number,
    roomSize: Number,
    availableSeats: [Number]

}, {timestamps: true});


seanceSchema.methods.validSeat = function(seat) {
    console.log(this.availableSeats.includes(seat));
    if (this.availableSeats.includes(seat)) {
        return true;
    }
    return false;
};



module.exports = mongoose.model("Seance", seanceSchema);



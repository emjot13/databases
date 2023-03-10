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
    return this.availableSeats.includes(seat);

};



module.exports = mongoose.model("Seance", seanceSchema);



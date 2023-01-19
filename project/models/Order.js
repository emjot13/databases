const { mongoose } = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.ObjectId, required: true},
    seanceId: { type: mongoose.ObjectId, required: true},
    seat: { type: Number, required: true },
    room: {type: Number, required: true},
    price: {type: Number, required: true},
    paid: {type: Boolean, required: true}

},{
    timestamps:true
});

module.exports = mongoose.model("order", orderSchema);



const { mongoose } = require("mongoose");
require('mongoose-type-url');
const Mongoose = require('mongoose').Mongoose;
const moviesCollection = new Mongoose();
moviesCollection.connect("mongodb://localhost:2000/movies", { useNewUrlParser: true })







const movieSchema = moviesCollection.Schema({
    title: { type: String, required: true, maxLength: 100 },
    genre: {
        type: String,
        enum: [
            "action", "adventure", "comedy", "drama", "fantasy", "horror", "musicals",
            "mystery", "romance", "science", "fiction", "sports", "thriller", "western"
        ]

    },
    premiere: Date,
    director: String,
    actors: [String],
    trailer: mongoose.SchemaTypes.Url,
    gallery: mongoose.SchemaTypes.Url,

});

module.exports = moviesCollection.model("Movie", movieSchema);
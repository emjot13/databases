const express = require('express');
const Movie = require('../models/Movie');
const Seance = require('../models/Seance')
const router = express.Router();


router.get("/movies", async (req, res) => {
    let filter = {};
    if (req.query.title) {
        filter.name = new RegExp(req.query.title, 'i');
    }
    if (req.query.director) {
        filter.director = req.query.director;
    }
    if (req.query.premiere) {
        filter.quantity = req.query.premiere;
    }

    if (req.query.genre) {
        filter.genre = req.query.genre;
    }


    const movie = await Movie.find(filter);
    res.send(movie);
  });

router.get("/movies/:id", async (req, res) => {
    const movie = await Movie.findOne({ _id: req.params.id });
    res.send(movie);
});



router.get("/movies/premiere_before/:date", async (req, res) => {
    let date = req.params.date
    const movies = await Movie.aggregate([
        { $match: {
            premiere: { $lte: new Date(date)}
            }}
    ]);

    res.send(movies);
});

router.get("/movies/premiere_after/:date", async (req, res) => {
    let date = req.params.date
    const movies = await Movie.aggregate([
        { $match: {
                premiere: { $gte: new Date(date)}
            }}
    ]);

    res.send(movies);
    });

router.get("/movies/actors/:actor", async (req, res) => {
    let actor = req.params.actor;
    const movies = await Movie.find({
        actors: {
            $elemMatch: {
                $eq: actor
            }
        }
    })

    res.send(movies);
});


router.get("/seances/day/:day", async (req, res) => {
    let day = req.params.day;
    let start = new Date(new Date(day).setHours(1, 0, 0))
    let end = new Date(new Date(day).setHours(24, 59, 59))
    const seances = await Seance.find({
        date: { $gte: start, $lt: end }
    })

    res.send(seances);
});


router.post("/seances/:id", async (req, res) => {
    let id = req.params.id;
    let seat =  parseInt(req.query.seat);
    let seance = await Seance.findOne({_id: id})
    let seats = seance.availableSeats
    if (!seats.includes(seat)){
        res.send("This seat is already taken")
    }
    else {
    let newSeats = seats.filter(x => x !== seat);
    seance.availableSeats = newSeats;
    seance.save()
    res.send(seance)
    };
});



module.exports = router;
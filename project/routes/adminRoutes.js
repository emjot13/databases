const express = require('express');
const Movie = require('../models/Movie');
const Seance = require('../models/Seance');
const WelcomeScreen = require("../models/WelcomeScreen")

const adminRouter = express.Router();



adminRouter.post("/welcomeScreen", async (req, res) => {
    try {
        let welcomeScreen = new WelcomeScreen({...req.body});
        await welcomeScreen.save();
        let createdAt = `${req.protocol}://${req.get('host')}${req.originalUrl}/${welcomeScreen.id}`;
        res.setHeader('Location', createdAt);
        res.status(201).send(welcomeScreen);
    }
    catch (err) {
        res.status(404).json({message: err.message});
    }
});



adminRouter.get("/welcomeScreen", async (req, res) => {
    res.status(200).send(welcomeScreen.find())
});


adminRouter.post("/seances", async (req, res) => {
    try {
        console.log(req.body.date)
        let seance = new Seance({...req.body});
        seance.availableSeats = Array.from({length: req.body.roomSize},(v, k) => k + 1)
        await seance.save();
        let createdAt = `${req.protocol}://${req.get('host')}${req.originalUrl}/${seance.id}`;
        res.setHeader('Location', createdAt);
        res.status(201).send(seance);
    }
    catch (err) {
        res.status(404).json({message: err.message});
    }
});





adminRouter.post("/movies", async (req, res) => {
    try {
    const post = new Movie({...req.body});
    await post.save();
    let createdAt = `${req.protocol}://${req.get('host')}${req.originalUrl}/${post.id}`;
    res.setHeader('Location', createdAt);
    res.status(201).send(post);
}
    catch (err) {
        res.status(404).json({message: err.message});
    }
});




adminRouter.patch("/movies/:id", async (req, res) => {
    try {
    const movie = await Movie.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
    res.status(201).send(movie);
}
    catch (err) {
        res.status(500).json({message: err.message});
    }
});



adminRouter.delete("/movies/:id", async (req, res) => {
	try {
		await Movie.deleteOne({ _id: req.params.id })
		res.status(204).send()
	}     catch (err) {
        res.status(404).json({message: err.message});
    }
})


adminRouter.delete("/clearDatabase", async (req, res) => {
	try {
		await Movie.deleteMany({})
		res.status(204).send()
	}     catch (err) {
        res.status(404).json({message: err.message});
    }
})





module.exports = adminRouter;
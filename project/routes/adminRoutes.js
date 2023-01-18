const express = require('express');
const Movie = require('../models/Movie');
const Seance = require('../models/Seance');

const adminRouter = express.Router();



adminRouter.post("/seances", async (req, res) => {
    try {
        const post = new Seance({...req.body});
        await post.save();
        let createdAt = `${req.protocol}://${req.get('host')}${req.originalUrl}/${post.id}`;
        res.setHeader('Location', createdAt);
        res.status(201).send(post);
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
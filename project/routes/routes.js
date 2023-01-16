const express = require('express');
const Movie = require('../models/Movie');
const router = express.Router();


router.get("/movies", async (req, res) => {
    const posts = await Movie.find();
    res.send(posts);
  });

router.post("/movies", async (req, res) => {
    try {
    const post = new Movie({...req.body});
    await post.save();
    let createdAt = `${req.protocol}://${req.get('host')}${req.originalUrl}/${post.id}`;
    res.setHeader('Location', createdAt);
    res.status(201).send(post);
}
    catch (err) {
        res.status(500).json({message: err.message});
    }
});


module.exports = router;
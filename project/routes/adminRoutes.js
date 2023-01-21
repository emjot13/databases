const express = require('express');
const Movie = require('../models/Movie');
const Seance = require('../models/Seance');
const WelcomeScreen = require("../models/WelcomeScreen")
const Order = require("../models/Order")

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
    try {
        const welcomeScreen = await WelcomeScreen.findOne().sort({createdAt: -1});
        if (!welcomeScreen) {
            res.status(404).send("No WelcomeScreen object found");
        } else {
            res.status(200).send(welcomeScreen);
        }
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});


adminRouter.post("/seances", async (req, res) => {
    try {
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
        if (!movie) {
            res.status(404).send("No movie object found with that id");
        } else {
            res.status(200).send(movie);
        }
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});


adminRouter.delete("/movies/:id", async (req, res) => {
    try {
        const movie = await Movie.findOneAndDelete({ _id: req.params.id });
        if (!movie) {
            res.status(404).send("No movie object found with that id");
        } else {
            res.status(204).send();
        }
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});


adminRouter.delete("/clearDatabase", async (req, res) => {
    try {
        await Movie.deleteMany({});
        res.status(204).send();
    } catch (err) {
        res.status(404).json({message: err.message});
    }
});



adminRouter.get("/total-income", async (req, res) => {
    let day = req.query.day;
    let month = req.query.month;
    try {
        let match = { paid: true };
        if (day) {
            match.createdAt = {
                $gte: new Date(`${day} 00:00:00`),
                $lt: new Date(`${day} 23:59:59`)
            };
        }
        if (month) {
            match.createdAt = {
                $gte: new Date(`${month} 1, 00:00:00`),
                $lt: new Date(`${month} 31, 23:59:59`)
            };
        }
        let result = await Order.aggregate([
            { $match: match },
            { $group: { _id: null, totalIncome: { $sum: "$price" } } }
        ]);
        if (!result.length) {
            return res.status(404).json({ message: "No matching orders found" });
        }
        res.json({ totalIncome: result[0].totalIncome });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});



module.exports = adminRouter;
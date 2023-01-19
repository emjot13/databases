const express = require('express');
const Movie = require('../models/Movie');
const Seance = require('../models/Seance');
const User = require('../models/User');
const Order = require("../models/Order")

const userRouter = express.Router();



userRouter.post("/register", async (req, res) => {
    try {
        let user = new User({...req.body});
        await user.save();
        let createdAt = `${req.protocol}://${req.get('host')}${req.originalUrl}/${user.id}`;
        res.setHeader('Location', createdAt);
        res.status(201).send(user);
    }
    catch (err) {
        res.status(404).json({message: err.message});
    }
});

userRouter.post("/login", async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let user = await User.findOne({username: username})
        console.log(user)
        if (user !== null && user.comparePassword(password)){
            if (user.loggedIn){
                res.send("Already logged in")
            }
            else {
            user.loggedIn = true
            await user.save();
            res.send("Logged in")
            }
        }
        else {
            res.status(401).send("Incorrect password or username")
        }
    }
    catch (err) {
        res.status(404).json({message: err.message});
    }
});
userRouter.post("/logout", async (req, res) => {
    try {
        let username = req.body.username;
        let user = await User.findOne({username: username})
        if (user === null){
            res.send("No such user")
        }
        else {
            if (user.loggedIn){
                res.send("Logged out")
                user.loggedIn = false;
                await user.save();
            }
            else {
                res.send("Was not logged in")
            }
        }

    }
    catch (err) {
        res.status(404).json({message: err.message});
    }
});

userRouter.post("/seances/:id", async (req, res) => {
    let seanceId = req.params.id;
    let seat = parseInt(req.query.seat);
    let username = req.body.username
    let user = await User.findOne({username: username})
    console.log(user)
    if (user !== null) {
        if (!user.loggedIn){
            res.send("You have to log in first")
        }
        else {
            let seance = await Seance.findOne({_id: seanceId})
            let seats = seance.availableSeats
            if (!seance.validSeat(seat)){
                res.send("This seat is already taken")
            }
            else {
                let newSeats = seats.filter(x => x !== seat);
                seance.availableSeats = newSeats;
                seance.save()
                res.send(seance)
            }
        }

    }
    else {
        res.send("No such user")
    }
});




// adminRouter.post("/movies", async (req, res) => {
//     try {
//     const post = new Movie({...req.body});
//     await post.save();
//     let createdAt = `${req.protocol}://${req.get('host')}${req.originalUrl}/${post.id}`;
//     res.setHeader('Location', createdAt);
//     res.status(201).send(post);
// }
//     catch (err) {
//         res.status(404).json({message: err.message});
//     }
// });




// adminRouter.patch("/movies/:id", async (req, res) => {
//     try {
//     const movie = await Movie.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
//     res.status(201).send(movie);
// }
//     catch (err) {
//         res.status(500).json({message: err.message});
//     }
// });



// adminRouter.delete("/movies/:id", async (req, res) => {
// 	try {
// 		await Movie.deleteOne({ _id: req.params.id })
// 		res.status(204).send()
// 	}     catch (err) {
//         res.status(404).json({message: err.message});
//     }
// })


// adminRouter.delete("/clearDatabase", async (req, res) => {
// 	try {
// 		await Movie.deleteMany({})
// 		res.status(204).send()
// 	}     catch (err) {
//         res.status(404).json({message: err.message});
//     }
// })





module.exports = userRouter;
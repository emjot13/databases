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


userRouter.patch("/changePassword", async (req, res) => {
    try {
        let username = req.body.username;
        let oldPassword = req.body.oldPassword;
        let newPassword = req.body.newPassword;
        let user = await User.findOne({username: username, loggedIn: true})
        if (!user){
            return res.send("You have to log in first")
        }

        if (user.comparePassword(oldPassword)){
            user.password = newPassword;
            user.save()
        }
        else {
            res.status(401).send("Incorrect password or username")
        }
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

userRouter.get('/orders/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const orders = await Order.find({ userId: req.params.id });
        return res.json(orders);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});


userRouter.post("/seances/:id", async (req, res) => {
    let seanceId = req.params.id;
    let seat = parseInt(req.query.seat);
    let username = req.body.username;

    let user = await User.findOne({username: username, loggedIn: true});
    if (!user) {
        return res.send("You have to log in first");
    }

    let seance = await Seance.findOne({_id: seanceId, availableSeats:  seat});
    if (!seance) {
        return res.send("This seat is already taken");
    }

    let newOrder = new Order({
        userId: user._id,
        seanceId: seance._id,
        seat: seat,
        room: seance.room,
        price: seance.ticketPrice
    });
    await newOrder.save();

    await Seance.updateOne({_id: seanceId}, { $pull: { availableSeats: seat } });
    await User.updateOne({_id: user._id}, { $push: { orders: newOrder._id } });

    res.send(newOrder);
});




// delete order
userRouter.delete("/orders/:id", async (req, res) => {
    let orderId = req.params.id;

    let order = await Order.findOne({_id: orderId});
    if (!order) {
        return res.send("No such order");
    }

    let user = await User.findOne({_id: order.userId, loggedIn: true});
    if (!user) {
        return res.send("You have to log in first");
    }

    await Seance.updateOne({_id: order.seanceId}, { $push: { availableSeats: order.seat } });
    await User.updateOne({_id: user._id}, { $pull: { orders: order._id } });
    await Order.deleteOne({_id: orderId});

    res.send(user.orders);
});


userRouter.patch("/orders/:id", async (req, res) => {
    let orderId = req.params.id;
    let newSeat = req.body.seat;
    let username = req.body.username;
    try {
        let user = await User.findOne({username: username, loggedIn: true});
        if (!user) {
            return res.send("You have to log in first");
        }
        let order = await Order.findOne({_id: orderId, userId: user._id});
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        let seance = await Seance.findOne({_id: order.seanceId});
        if (!seance.validSeat(newSeat)) {
            return res.send("This seat is already taken");
        }
        order.seat = newSeat;
        await order.save();
        seance.availableSeats.push(seat);
        await seance.save();
        res.json(order);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

userRouter.post("/pay", (req, res) => {
    const { userId, money } = req.body;

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            return Order.find({ userId, paid: false })
                .then(orders => {
                    const totalPrice = orders.reduce((acc, order) => acc + order.price, 0);
                    if (totalPrice !== money) {
                        return res.status(400).send(`Invalid amount of money, you have to pay ${totalPrice}`);
                    }
                    return Promise.all(orders.map(order => {
                        order.paid = true;
                        return order.save();
                    }))
                        .then(() => res.status(200).send("Orders paid successfully"))
                })
        })
        .catch(err => res.status(500).send(err.message));
});


module.exports = userRouter;




























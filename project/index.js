const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const adminRoutes = require("./routes/adminRoutes");



const app = express();
app.use(express.json());
app.use("/api", routes);
app.use("/admin/api", adminRoutes);


app.listen(5000, () => {
    console.log("Server has started!");
});

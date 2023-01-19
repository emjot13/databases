const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");


const server = '127.0.0.1:2000'
const database = 'cinema' 



const connectDB = (async () => {
    try {
      await mongoose.connect(`mongodb://${server}/${database}`)
  
      console.log('MongoDB connected!!')
    } catch (err) {
      console.log('Failed to connect to MongoDB', err)
    }
  })();




const app = express();
app.use(express.json());
app.use("/api", routes);
app.use("/admin/api", adminRoutes);
app.use("/users", userRoutes);


app.listen(5000, () => {
console.log("Server has started!");
});







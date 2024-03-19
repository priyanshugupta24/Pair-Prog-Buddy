const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const loginRoutes = require("./routes/loginRoutes.js");
const friendRoutes = require("./routes/friendRoutes.js");
const cors = require('cors');
var dotenv = require('dotenv').config();
var mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const mongooseUrl = process.env.MONGOOSEURL;

mongoose.pluralize(null);
mongoose.connect(mongooseUrl).then(()=>console.log("Connected to Database Successfully!!")).catch((err)=>console.log(err));

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());
app.get("/",(req,res)=>{
    res.send("Working");
})
app.use('/api', loginRoutes);
app.use('/api', friendRoutes);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

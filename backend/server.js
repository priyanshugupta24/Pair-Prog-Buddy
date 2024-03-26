const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const loginRoutes = require("./routes/loginRoutes.js");
const friendRoutes = require("./routes/friendRoutes.js");
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const { WhiteBoard } = require("./websockets/whiteboard.websocket.js");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const mongooseUrl = process.env.MONGOOSEURL;

mongoose.pluralize(null);
mongoose.connect(mongooseUrl).then(() => console.log("Connected to Database Successfully!!")).catch((err) => console.log(err));

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Working");
});

app.use('/api', loginRoutes);
app.use('/api', friendRoutes);
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     next();
// });

WhiteBoard(server);

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
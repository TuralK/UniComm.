const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.urlencoded({extended:false})); // to obtain the data coming from forms in a json structure.
app.use(express.json());  //to be able to send data as a json format via postman
app.set("view engine", "ejs");

app.use(express.static("style"));
app.use(express.static("public"));
app.use(express.static("node_modules"));
app.use(express.static("helper scripts"));
app.use(express.static("background_pictures"));
app.use(express.static("uni_background"));
app.use(express.static("profile_pictures"));
app.use(express.static("uni_logo"));

app.use(cookieParser());

const pages = require("./routes/pages");
const auth = require("./routes/auth");
const apiRouter = require('./routes/api');

app.use('/api', apiRouter);
app.use(pages);
app.use(auth);

app.listen(3000, () => {
  console.log("Server started on Port 3000");
})
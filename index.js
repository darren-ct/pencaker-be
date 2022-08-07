const express = require("express");
const cors = require("cors");

const app = express();

require("dotenv").config();

// Connect
const sequelize = require("./config/connect");
const verifyJWT = require("./middlewares/verifyJWT");
const {notification} = require("./controllers/transaction")

sequelize.authenticate().then(()=>{
    console.log("connected")
});

// Cors
app.use(cors());

// Middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(express.static("uploads"));

app.post("/notification",notification)
app.use("/", require("./routes/auth"));
app.use("/",require("./routes/job"))

app.use(verifyJWT);
app.use("/",require("./routes/transaction"));
app.use("/",require("./routes/user"));


// listen
app.listen(process.env.PORT,()=>{
     console.log("Connected")
});
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT")



const { registerUser, loginUser, checkAuth  } = require("../controllers/auth");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check-auth", verifyJWT, checkAuth);


module.exports = router;
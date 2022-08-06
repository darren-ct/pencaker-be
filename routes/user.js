const express = require("express");
const router = express.Router();
const {uploadFile} = require("../middlewares/uploadFile")

const {editUser,getMyImage} = require("../controllers/user");


router.put("/user", uploadFile("image"), editUser);
router.get("/user",getMyImage)


module.exports = router;
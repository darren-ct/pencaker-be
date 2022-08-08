const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT")


const { getJobs, getJob,getMyJobs,postJob,applyJob , getAppliedJobs } = require("../controllers/job");


router.get("/jobs", getJobs);
router.get("/job/:id", getJob);
router.get("/myjobs",verifyJWT,getMyJobs)
router.post("/job", verifyJWT , postJob);
router.post("/job/apply", verifyJWT , applyJob);
router.get("/job/applied",verifyJWT , getAppliedJobs);



module.exports = router;

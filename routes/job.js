const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT")


const { getJobs, getJob, getMyJob, getMyJobs, postJob, applyJob , getAppliedJobs } = require("../controllers/job");

router.get("/job/applied",verifyJWT , getAppliedJobs);
router.get("/jobs", getJobs);
router.get("/job/:id", getJob);
router.get("/myjobs",verifyJWT,getMyJobs)
router.get("/myjob/:id",verifyJWT,getMyJob);
router.post("/job", verifyJWT , postJob);
router.post("/job/apply", verifyJWT , applyJob);




module.exports = router;

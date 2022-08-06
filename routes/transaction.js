const express = require("express");
const router = express.Router();

const verifyAdmin = require("../middlewares/verifyAdmin")
const {getAllTransactions,postTransaction} = require("../controllers/transaction");


router.get("/transactions", verifyAdmin , getAllTransactions);
router.post("/transaction", postTransaction);


module.exports = router;
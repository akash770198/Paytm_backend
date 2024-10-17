const express = require ("express");
const userRouter = require("./user");
const accountRouter = require("./account")

const router = express.Router();

router.use("/user", userRouter); //all request to /api/v1/user will go to user router
router.use("/account", accountRouter);


module.exports = router;
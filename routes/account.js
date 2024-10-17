const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account, User } = require("../db"); 
const mongoose = require("mongoose");

const router = express.Router();

router.get("/balance", authMiddleware, async (req,res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
})


//create a session if anyone fails please revert also
//two simulataneous requests also doesnot pass for same user
router.post("/transfer", authMiddleware, async (req,res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    const {amount, to} = req.body;

    //fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId }).session(session);

    if(!account || account.balance < amount || amount <= 0) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance or Invalid amount"
        });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if(!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }

    //perform the transfer
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: {balance: amount } }).session(session);

    // commit the transaction
    await session.commitTransaction();
    res.status(200).json({
        message: "Transfer successful"
    });
});

module.exports = router;
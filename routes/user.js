const express = require("express");
const zod = require("zod");
const {JWT_SECRET} = require("../config");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware");
const { Account, User } = require("../db"); 

const router = express.Router();

const signupSchema = zod.object({ //creating a zod schema
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.post("/signup", async (req, res) => {
    const body = req.body;
    const { success } = signupSchema.safeParse(req.body);
    if (!success) { //checking the schema of input
        return res.status(400).json({
            message: "Incorrect inputs..."
        })
    }

    const existingUser = await User.findOne({ //checking if user already exists or not
        username: body.username
    })

    if (existingUser) { //if exists ....
        return res.status(409).json({
            message: "Email already taken..."
        })
    }

    //otherwise....
    //creating a new user
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })
    const userId = user._id;


    //----- Create new account ------

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    //----- -----

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.status(201).json({
        message: "User created successfully",
        token: token
    })
})

router.post("/signin", async (req, res) => {
    const body = req.body;
    const { success } = signinSchema.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs...."
        })
    }

    const user = await User.findOne({
        username: body.username,
        password: body.password
    })

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.status(201).json({
            message: "signed in successfully",
            token: token
        })
        return;
    }

    res.status(411).json({
        message: "Error while logging in"
    })
})

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.findOne({ _id: req.userId }, req.body);

    res.json({
        message: "Updated successfully"
    })
})

router.get("/me", authMiddleware, async(req,res) => {
    const user = await User.findOne({_id: req.userId});
    res.json({
        firstName: user.firstName
    })
})


//getting names by just entering some chars 
router.get("/bulk",authMiddleware, async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        _id: { $ne: req.userId },
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;

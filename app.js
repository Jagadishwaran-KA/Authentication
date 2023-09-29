require('dotenv').config()
require("./config/database").connect();
const express = require("express");
const User = require("./model/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require("./middlewares/auth");
const cookieParser = require('cookie-parser')
const app = express();
app.use(express.json());
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Hello Mother Fucker");
})


app.post("/register", async (req, res) => {

    try {

        const { firstname, lastname, email, password } = req.body;

        if (!(firstname && lastname && email && password)) {
            res.status(403).send("Please Provide All the Fields");
        }

        const exisitingUser = await User.findOne({ email });

        if (exisitingUser) {
            res.status(400).send("User Already Registered");
        }


        const encrypted = await bcrypt.hash(password, 10);


        const user = await User.create({
            firstname,
            lastname,
            email,
            password: encrypted
        });

        user.password = undefined
        res.status(200).json(user);
    } catch (error) {
        console.log("error ", error);
    }
})

app.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!(email && password)) {
            res.status(400).send("Field is Missing");
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({
                user_id: user._id,
                email
            }, process.env.SECRET, {
                expiresIn: "2h"
            })

            user.token = token
            user.password = undefined

            const options = {
                expires: new Date(
                    Date.now() + (3 * 24 * 60 * 60 * 1000)
                ),
                httpOnly: true
            }

            res.status(200).cookie('token', token, options).json({
                token,
                user
            });
        }

        res.send("Email or Password is Incorrect")

    } catch (error) {
        console.log(error);
    }
})



app.get("/secret-information", auth, (req, res) => {
    res.send("Well We Fucked Up!");
})


app.post("/logout", auth, (req, res) => {

    try {

        res.clearCookie('token').send("Logged Out!");

    } catch (error) {
        res.redirect("/login");
    }


})


module.exports = app;

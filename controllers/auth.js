const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); 
const { Eics } = require("../models/db");

/**
 * Endpoint /api/auth/signin
 */
router.post("/signin", async function signin(req, res, next) {
  try {
    console.log(req.body.username);

    const eic = await Eics.findOne({ username: req.body.username })


    if (!eic) {
        res.status(400).json({ "message": "eic account not found; wrong username" })
    } else {
        const isCorrectPassword = await bcrypt.compare(req.body.password, eic['password']);
        console.log(isCorrectPassword)

        if(isCorrectPassword) {
            const token = jwt.sign( eic.username, process.env.TOKEN_SECRET)
            res.status(200).json({ token: token })
        } else {
            res.status(401).json({ "message": "incorrect password" })
        }
    }

    
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

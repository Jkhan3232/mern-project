const { use } = require("bcrypt/promises");
const res = require("express/lib/response");
const async = require("hbs/lib/async");
const jwt = require("jsonwebtoken");
const JKWorld = require("../models/schema");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    console.log(verifyUser);

    const user = await JKWorld.findOne({ _id: verifyUser });

    console.log(user.firstname);

    req.token = token;
    req.user = user;

    next();
  } catch {
    res.status(401).send("this not velid user");
  }
};

module.exports = auth;

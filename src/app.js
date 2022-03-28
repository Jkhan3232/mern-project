require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const hbs = require("hbs");
require("./db/conect");
const JKWorld = require("./models/schema");
const bcrypt = require("bcrypt");
const cookie = require("cookie-parser");
const auth = require("./middlewere/auth");
const async = require("hbs/lib/async");
const { status } = require("express/lib/response");

const htmlPath = path.join(__dirname, "../public");
const view_Path = path.join(__dirname, "../template/views");
const paritals = path.join(__dirname, "../template/partials");

app.use(express.json());
app.use(cookie());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(htmlPath));
app.set("view engine", "hbs");
app.set("views", view_Path);
hbs.registerPartials(paritals);

console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrate", auth, (req, res) => {
  // console.log(`crate our cookie ${req.cookies.jwt}`);
  res.render("secrate");
});

app.get("/logout", auth, async (req, res) => {
  try {
    // req.user.tokens = req.user.tokens.filter((currntElm) => {
    //   return currntElm.token !== req.token;
    // });

    req.user.tokens = [];

    res.clearCookie("jwt");
    console.log("logot successfully..");
    await req.user.save();
    res.render("login");
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    if (password === cpassword) {
      const Jkreisgter = new JKWorld({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        age: req.body.age,
        password: password,
        confirmpassword: cpassword,
      });

      // console.log("the jwt part" + Jkreisgter);
      const token = await Jkreisgter.genrateAuthToken();
      // console.log("The token part" + token);

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 100000),
        httpOnly: true,
      });

      const registerjk = await Jkreisgter.save();
      // console.log("passing page" + registerjk);

      res.status(200).render("index");
      // console.log(registerjk);
    } else {
      res.send("Password is not match");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const usremail = await JKWorld.findOne({ email: email });

    const isMail = await bcrypt.compare(password, usremail.password);

    const token = await usremail.genrateAuthToken();
    // console.log("The token part" + token);

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 100000),
      httpOnly: true,
    });

    if (isMail) {
      res.status(201).render("index");
    } else {
      res.send("passwor is not match");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Secure Passwrd By Bcrypt

// const bcrypt = require("bcrypt");

// const securePassword = async (password) => {
//   const hashpass = await bcrypt.hash(password, 10);
//   console.log(hashpass);
//   const checkHashn = await bcrypt.compare(password, hashpass);
//   console.log(checkHashn);
// };

// securePassword("Khan@.123");

// const jwt = require("jsonwebtoken");

// const cookisAuth = async () => {
//   const token = await jwt.sign(
//     { id: "623ef30d89b644bce8f75ff8" },
//     "jeeshankhanimawebdevloperinhtmlcssnodejsjavascript"
//   );
//   console.log(token);
//   const veruser = await jwt.verify(
//     token,
//     "jeeshankhanimawebdevloperinhtmlcssnodejsjavascript"
//   );
//   console.log(veruser);
// };

// cookisAuth();

app.listen(port, () => {
  console.log(`lisining port no. ${port}`);
});

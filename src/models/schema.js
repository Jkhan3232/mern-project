const async = require("hbs/lib/async");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const worldSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
  },

  lastname: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("put the velid email id");
      }
    },
  },

  gender: {
    type: String,
    required: true,
  },

  phone: {
    type: Number,
    required: true,
    min: 10,
    unique: true,
  },

  age: {
    type: Number,
    require: true,
  },

  password: {
    type: String,
    required: true,
  },

  confirmpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

worldSchema.methods.genrateAuthToken = async function () {
  try {
    console.log(this._id);
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log("err" + err);
  }
};

worldSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    console.log(`password is ${this.password}`);
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmpassword = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Model Creatation

const JKWorld = new mongoose.model("JKWorld", worldSchema);
module.exports = JKWorld;

const { User } = require("../Models/user");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const usersList = await User.find().select("-passwordHash"); // select('-fieldName') : sends object except specified field
  if (!usersList) {
    res.send(500, { success: false });
  }
  res.send(usersList);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    // this is used in case if we send some invalid user id, to catch that error.
    res.status(400).send("Invalid user Id.");
  }
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    res.send(500, { success: false });
  }
  res.send(user);
});

router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save();
  if (!user) {
    return res.status(404).send("The user cannot be created");
  }
  res.send(user);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;
  if (!user) {
    return res.status(400).send("The user not found.");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id, // we get to know through the token if user is authenticated and generated token.
        isAdmin: user.isAdmin, // we get to know in the token that if user is an admin or not.
        // added admin field in the token because we have 2 types of users- cutomers and admin
        //customers- don't get to delete posts, can only see products
        //admins- get more accessibility.
      },
      secret,
      { expiresIn: "1d" }
    );
    console.log(token);
    res.send({ user: user.email, token: token });
  } else {
    res.status(400).send("The password is wrong");
  }
});

router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save();
  if (!user) {
    return res.status(404).send("The user cannot be created");
  }
  res.send(user);
});

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id) //findByIdAndRemove(req.params.id): takes the id via params and remove that object if present.
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "The user is deleted." });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "The user is not found." });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  const userCount = await User.countDocuments((count) => count);
  //countDocuments() : counts all the items present in the model object.
  if (!userCount) {
    return res.send(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

module.exports = router;

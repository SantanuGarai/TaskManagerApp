const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", ""); // extract the token
    const decode = jwt.verify(token, "thisismynewcourse"); // verity the token with the string
    const user = await User.findOne({ _id: decode._id, "tokens.token": token }); // verity whether a user exist with the id and token
    if (!user) {
      throw new Error("");
    }
    req.token = token;
    req.user = user; // set the user with req, so that later we dont have to fetch user object again
    next();
  } catch (e) {
    res.status(401).send({ error: "Please Authenticate" });
  }
};

module.exports = auth;

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send("Unautorized");
    }

    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.jwtSecret
    );

    req.userId = userId;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send("Unautorized");
  }
};

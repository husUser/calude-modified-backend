const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).json({ errors: "You are not Authorized" });
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ errors: "error in managing token in auth section", err });
    console.log(err);
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };

// 0 user (default)
// 1 lab technician  (operator)
// 2  TA
// 3  admin
// 4  super-admin
// 5   professor

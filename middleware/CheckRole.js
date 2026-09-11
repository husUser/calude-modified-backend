// roleMiddleware.js
const checkRole = (roles) => {
    return (req, res, next) => {
        // console.log(req.user.userRole)
        if (!roles.includes(req.user.userRole)) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};

module.exports = {checkRole};


// 0 user (default)
// 1 lab technician  (operator)
// 2  TA
// 3  admin 
// 4  super-admin
// 5   professor
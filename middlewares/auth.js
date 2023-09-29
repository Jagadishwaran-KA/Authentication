const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const token = req.cookies.token || req.body.token;
    console.log(token);
    if (token === undefined) {
        res.send("Please Login First");
    } else {
        try {
            const decode = jwt.verify(token, process.env.SECRET);
            console.log(decode);

        } catch (error) {
            console.log(error);
        }
    }
    next();
}



module.exports = auth;
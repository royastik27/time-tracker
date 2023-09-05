const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');

exports.validateToken = function (req, res, next) {

    const token = req.cookies.token;

    try {
        const result = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

        res.locals.uID = new ObjectId(result.uID);

        next();
    }
    catch(err) {

        res.json({
            ok: false,
            message: err.message
        });
    }
}
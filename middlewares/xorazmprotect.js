const jwt = require('jsonwebtoken');
const asyncHandler = require('../middlewares/asyncHandler.js');
const ErrorResponse = require('../utils/errorResponse.js');

module.exports = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new ErrorResponse('Token notog\'ri jonatildi', 403));
    }
    try {
        const decoded = token === process.env.SECRETKEY
        if (!decoded) {
            return next(new ErrorResponse("Unable to enter", 403));
            req.user = false
        }
        req.user = true;
        next();
    } catch (err) {
        return next(new ErrorResponse('Token eskirgan yoki yaroqsiz', 403));
    }
});
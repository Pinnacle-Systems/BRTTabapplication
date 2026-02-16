import jwt from "jsonwebtoken";

export function authenticateRequest(req, res, next) {
    const authheader = req.headers.authorization;
    if (!authheader) {
        let err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err)
    }
    try {
        var token = authheader.split(' ')[1];
        const decoded = jwt.verify(token, "RANDOM-TOKEN");
        next()
    } catch (e) {
        let err = new Error('Token no valid!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err)
    }
}
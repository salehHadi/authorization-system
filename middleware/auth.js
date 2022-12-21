const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
    console.log(req.cookies)
    const token = 
    req.cookies.token ||
    req.body.token ||
    req.header('Authorization').replace('Bearer ', '');

    if(!token) {
        res.stause(403).send("token is missing")
    }

    try{
        const decode = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decode
            // bring in info id from DB
    } catch(error) {
        return res.status(401).send('Invalid token')
    }

    return next();
}

module.exports = auth
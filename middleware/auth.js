const jwt = require("jsonwebtoken");
const { promisify } = require('util');
const dotenv = require('dotenv');
dotenv.config({ path: './.env'});   

module.exports = async function (req, res, next){
    const token = req.cookies.jwt;
    if(!token){
        req.user = null;
        return next();
        //return res.status(401).send("Yetkiniz yok");
    }
    try {
        const decodedToken = await promisify(jwt.verify)(req.cookies.jwt,
            process.env.JWT_SECRET
        );
        //const decodedToken = jwt.verify(token, 'privateKey');  //verify method throws exception if verification fails.
        req.user = decodedToken;
        next();
    } catch (error) {
        //res.status(400).JSON({ message: "Session expired." });
		res.redirect("/logout");
    }
    
}
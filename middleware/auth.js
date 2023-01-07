const session = require("express-session");

const isLogin = async function(req,res,next){
    try {
        console.log(req.session)
        if(req.session.loggedIn){
            next();
        }
        else{
            res.redirect('/login');
        }
        
    } catch (error) {
        console.log(error.message);
        next();
    }
}

const isLogout = async function(req,res,next){
    try {
        if(req.session.user_id){
            res.redirect('/home');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    isLogin,
    isLogout
}
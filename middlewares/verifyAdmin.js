module.exports = async(req,res,next) => {
    const isAdmin = req.user.status === "admin" ? true : false ;


    if(!isAdmin){
        return res.status(404).send({
            "status":"Forbidden",
            "message":"This route is only for admins"
        });

    }
    next();

    
};
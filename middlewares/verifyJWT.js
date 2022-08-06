const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {sendErr} = require("../helper/other")

require("dotenv");

module.exports = async(req,res,next) => {
       const bearer = req.headers.authorization;
       

       if(!bearer){
              return res.status(404).send({
                     "status" : "Error",
                     "message" : "No bearer token"
              })
       };

       const token = bearer.split(" ")[1];
       
       jwt.verify(token ,process.env.SECRET, async(err,decoded)=>{
              if(err) return res.status(404).send({
                     "status" : "Error",
                     "message" : "Invalid token",
                     
              });

              const userArr = await User.findAll({
                     where: {
                            id : decoded.id
                     }
              });

              if(userArr.length === 0){
                 return sendErr("Token doesnt match any user",res)
              }

              const user = userArr[0];

              req.user = {
                     id : user.id,
                     email : user.email,
                     name : user.name,
                     status : user.status,
                     
              }

              
              
              next();
       })


       
};


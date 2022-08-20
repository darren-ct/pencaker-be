
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


const {emailChecker,minimumChecker} = require("../helper/auth");
const {sendErr} = require("../helper/other")

const registerUser = async(req,res) => {
    const {name,email,password,status} = req.body;
     console.log(req.body)
    console.log(name,email,password,status)

    // Checking format
    if(!emailChecker(email)){
        return sendErr("Email format invalid",res)
    };

    if(!minimumChecker(name,4)){
        return sendErr("Username minimum 4 characters",res)
    };

    if(!minimumChecker(password,8)){
        return sendErr("Password minimum 8 characters",res)
    };

    if(status !== "member" && status !== "admin" && status !== "company"){
        return sendErr("Status invalid",res)
    };


    try {
        // Check any duplicate emails and username
        const duplicate = await User.findOne({
            where: { email: email
            },
            attributes:["email"]
        })

        if(duplicate){
            return sendErr("Email is already registered",res)
        };


        // Kalo lolos semua, insert user + profile
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            status : status
        });

        // Create token + response
        const token = jwt.sign({
           id: newUser.id,
           iat: Date.now(),
           expires : "1d"
        }, process.env.SECRET,
        {
            expiresIn:"1d"
        })

        return res.status(201).send({
             status:"Success",
             user : {
                    id : newUser.id,
                    name : newUser.name,
                    email : newUser.email,
                    status : newUser.status,
                    token : token,
                    
             }
             
        })

    } catch (err) {
        return sendErr("Server error",res)
    }

};

const loginUser = async(req,res) => {
    const{email,password} = req.body;


 try{
    //  check apakah email terdaftar
    const match = await User.findOne({
        where: {
            email : email
        } 
    });

    if(!match){
        return sendErr("Email not yet registered",res)
    };


    
    // check input passwordnya
    const matchedPw = match.password;
    const isMatch = bcrypt.compareSync(password,matchedPw);

    if(!isMatch){
        return sendErr("Wrong password",res)
    }


    // kasi token
    const token = jwt.sign({
        id : match.id,
        iat: Date.now(),
        expires : "1d"
     }, process.env.SECRET,
     {
         expiresIn:"1d"
     })

    // response
    return res.status(201).send({
        status:"Success",
        user : {
                id : match.id,
                name: match.name,
                email: match.email ,
                status : match.status,
                token : token,
        }
        
    }) 

     } catch (err) {

        return sendErr("Server error",res)

    }

};

const checkAuth = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const dataUser = await User.findOne({
        where: {
          id:userId
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      });
  
      if (!dataUser) {
        return res.status(404).send({
          status: "failed",
        });
      }
  
      res.send({
        status: "success",
        data: {
          user: {
            id: dataUser.id,
            name: dataUser.name,
            email: dataUser.email,
            status: dataUser.status,
          },
        },
      });
    } catch (error) {
      console.log(error);
      res.status({
        status: "failed",
        message: "Server Error",
      });
    }
  };

module.exports = {registerUser, loginUser, checkAuth};

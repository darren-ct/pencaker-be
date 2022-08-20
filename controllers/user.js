const User = require("../models/User");


const {sendErr} = require("../helper/other");

const fs = require('fs');
const path = require("path"); 

const editUser = async(req,res) => {
    const userId = req.user.id;
    const{name} = req.body;
    

    try {

        if(!name || name.length < 4){
            return sendErr("Name minimal must have a length of 4",res);
        };

        // Update
        if(!req.file){

          await User.update({
              name : name
          },{
             where : {id:userId}
          })


        } else {

            const oldUser = await User.findOne({
                where : {id:userId},
                attributes:["image"]
            })

            if (!oldUser){
                return sendErr("User not found",res)
            }

            await User.update({
                name : name,
                image : req.file.filename
            },{
               where : {id:userId}
            });

            if(oldUser.image){
                 fs.unlink(path.join(__dirname,"..","uploads",oldUser.image),
                 (err)=>{console.log(err)})
            };

        }

        // Return
        const newUser = await User.findOne({
            where : {id:userId},
            attributes : ["image"]
        });

        return res.status(201).send({
            status : "Success",
            image : newUser.image ? process.env.SERVER_URL + newUser.image : null
        })

    } catch (err) {
        console.log(err)
         sendErr("Server error",res)
    }
};

const getMyImage = async(req,res) => {
    const userId = req.user.id;

    try {
        const user = await User.findOne({
            where : {id:userId},
            attributes : ["image"]
        });

        return res.status(201).send({
            status : "Success",
            image: user.image ? process.env.SERVER_URL + user.image : null
        })

    } catch (err) {
        console.log(err)
         sendErr("Server error",res)
    }
}

module.exports = {editUser,getMyImage};

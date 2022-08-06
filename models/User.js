const {DataTypes} = require("sequelize");
const sequelize = require("../config/connect");

const User = sequelize.define("user", {
    id : {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    email : {
        type: DataTypes.STRING,
        unique:true,
        allowNull:false,
    },
    name : {
        type: DataTypes.STRING,
        allowNull:false,
    },

    password : {
        type: DataTypes.STRING,
        allowNull:false,
    },

    status : {
        type: DataTypes.STRING,
        allowNull:false
    },

    image : {
        type:DataTypes.STRING,
        allowNull:true
    }
},{
    timestamps:false,
    freezeTableName:true
})

User.sync()

module.exports = User;
const {DataTypes} = require("sequelize");
const sequelize = require("../config/connect");

const Apply = sequelize.define("apply", {
    member_id : {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true
    },
    job_id : {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
    }
},{
    timestamps:false,
    freezeTableName:true
})

Apply.sync()

module.exports = Apply;
const {DataTypes} = require("sequelize");
const sequelize = require("../config/connect");

// 
const Job = sequelize.define("job", {
    id : {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    position : {
        type: DataTypes.STRING,
        allowNull:false
    },
    location : {
        type: DataTypes.STRING,
        allowNull:false
    },
    description : {
        type: DataTypes.STRING,
        allowNull:false
    },
    salary_start : {
        type: DataTypes.INTEGER,
        allowNull:false
    },
    salary_end : {
        type: DataTypes.INTEGER,
        allowNull:false
    },
    company_id : {
        type: DataTypes.INTEGER,
        allowNull:false
    },
    status : {
        type: DataTypes.STRING,
        allowNull:false,
        defaultValue : "inactive"
    }

},{
    timestamps:true,
    freezeTableName:true
})

Job.sync()

module.exports = Job;
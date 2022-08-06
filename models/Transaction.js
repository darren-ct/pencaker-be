const {DataTypes} = require("sequelize");
const sequelize = require("../config/connect");

const Transaction = sequelize.define("transaction", {
    id : {
        type: DataTypes.INTEGER,
        primaryKey:true,
    },
    status : {
        type: DataTypes.STRING,
        allowNull:false,
    },
    amount : {
        type: DataTypes.INTEGER,
        allowNull:false,
    },

    job_id : {
        type: DataTypes.INTEGER,
        
    },

    company_id : {
        type: DataTypes.INTEGER,
    
    }

},{
    timestamps:true,
    freezeTableName:true
})

Transaction.sync();

module.exports = Transaction;
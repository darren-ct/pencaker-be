const Sequelize = require("sequelize");
const sequelize = new Sequelize("hackathon","raja","NDiwno129*&e",{
    host:"103.172.205.100",
    port:3306,
    dialect:"mysql"
});

module.exports = sequelize;
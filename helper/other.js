module.exports.sendErr = (message,res) => {
    res.status(400).send({
        status:"Error",
        message:message
    })
};

module.exports.getMonth = (month) => {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    return months[month - 1];
}
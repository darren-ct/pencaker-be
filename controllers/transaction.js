const Transaction = require("../models/Transaction");
const Job = require("../models/Job");


const sequelize = require("../config/connect")
const { QueryTypes } = require('sequelize');
const {sendErr} = require("../helper/other");

const midTransClient = require("midtrans-client");
const nodemailer = require("nodemailer");
require("dotenv").config();


const getAllTransactions = async(req,res) => {
    const query = `
    SELECT job.id AS job_id, position , location, 
    DAY(job.createdAt) AS day, MONTH(job.createdAt) AS month , YEAR(job.createdAt) AS year,
    user.id AS user_id , user.name , email,
    transaction.id AS transaction_id , transaction.status , amount
    
    FROM transaction INNER JOIN job 
    ON transaction.job_id = job.id 
    INNER JOIN user
    ON job.company_id = user.id
    `

   try {
         const result = await sequelize.query(
            query , {type:QueryTypes.SELECT}
         );

         let total = 0
 
         const transactions = result.map(transaction => {
            return {
                id : transaction.job_id,
                position : transaction.position,
                location : transaction.location,
                post_at : `${transaction.day} ${transaction.month} ${transaction.year}`,
                company : {
                    id : transaction.user_id ,
                    name : transaction.name,
                    email :  transaction.email,
                },
                transaction : {
                    id : transaction.transaction_id,
                    status : transaction.status,
                    amount : transaction.amount
                }
            }
         });
       
       // Calculate total
       transactions.forEach(transaction => {
       if(transaction.transaction.status === "success"){
             total = total + 150000
           }
       });
       
         
         return res.status(201).send({
            status : "Success",
            total : total,
            transactions : transactions
         })

   } catch (err) {
    console.log(err)
          return sendErr("Server error",res)
   }
}

const postTransaction = async(req,res) => {
    const companyId = req.user.id;
    const {jobId} = req.body;

    if(req.user.status !== "company"){
        return sendErr("Not a company",res)
    };
    
    
try{

    const jobToBePublish = await Job.findOne(
        {where: {id:jobId},
         attributes: ["id"]
        }
        );

    if(!jobToBePublish){
        return sendErr("Job doesnt exist",res)
    }
    
  const transaction = await Transaction.create({
      id : parseInt(jobId + Math.random().toString().slice(3,8)),
      status : "pending",
      amount : 150000, 
      job_id : jobId,
      company_id : companyId,
  });


//   Mid trans time
let snap = new midTransClient.Snap({
    isProduction:false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
});

let parameter = {
    transaction_details: {
        order_id: transaction.id,
        gross_amount: transaction.amount
    },
    credit_card:{
        secure : true
    },
    customer_details: {
        email: req.user.email,
        username : req.user.name
    }
}

const payment = await snap.createTransaction(parameter);


  return res.status(201).send({
      status:"Success",
      payment : payment
  });

    } catch(err) {

        return sendErr("Server error",res)

    }

};

const notification = async(req,res) => {
      try {
       
          
          // Create core
         const core = new midTransClient.CoreApi();

         core.apiConfig.set({
                 isProduction:false,
                 serverKey: process.env.MIDTRANS_SERVER_KEY,
                 clientKey:process.env.MIDTRANS_CLIENT_KEY
                 });

          const statusResponse = await core.transaction.notification(req.body);

          let orderId = statusResponse.order_id;
          let transactionStatus = statusResponse.transaction_status;
          let fraudStatus = statusResponse.fraud_status;
   
   
          if (transactionStatus == 'capture'){
              if (fraudStatus == 'challenge'){
                  updateTransaction("pending",orderId)
                  
                  
                  res.status(200);
              } else if (fraudStatus == 'accept'){
                updateTransaction("success",orderId)
                activateJob(orderId);
                
                res.status(200);
              }
          } else if (transactionStatus == 'settlement'){
              
              updateTransaction("success",orderId);
              activateJob(orderId);
              
              res.status(200);
          } else if (transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire'){
               updateTransaction("failed",orderId);
      
               
               res.status(200)
          } else if (transactionStatus == 'pending'){
             updateTransaction("pending",orderId)
             res.status(200)
          }

      } catch(err) {
           console.log(err)
      }
}

// other functions
const updateTransaction = async(status,orderId) => {
    await Transaction.update({
     status : status
    },{
     where : {
         id : orderId
     }
    });
};


const activateJob = async(orderId) => {
     
    try {
         const transaction = await Transaction.findOne({where:{id:orderId}});

         if(!transaction){
            return sendErr("Transaction not found",res);
         };

         const jobId = transaction.job_id;

         await Job.update({
            status : "active"
         },{where:{id:jobId}});
         
        //  30 hari timer
         setTimeout(async()=>{

                await Job.update({
                status : "inactive"
             },{where:{id:jobId}});
         
         },2592000000)

         return res.status(201).send({
            status:"Success"
         });


    } catch(err) {
         return sendErr("Server error",res);
    }
};

const sendEmail = async(status,transactionId) => {
   
    // transporter
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth: {
            user: process.env.SYSTEM_EMAIL,
            pass: process.env.SYSTEM_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // get transaction data
    const query = `
    SELECT email , username , transaction.id , transaction.status
    FROM transaction INNER JOIN user
    ON transaction.company_id = user.id AND transaction.id = ${transactionId}
    `

    
         const transactionInfo = await sequelize.query(
            query , {type:QueryTypes.SELECT}
         );

    // Email options content
    const mailOptions = {
        from : process.env.SYSTEM_EMAIL,
        to: transactionInfo[0].email,
        subject: "Payment Status",
        text: "Your payment is <br/>" + "Done",
        html: `<!doctype html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="description" content="My Page Description">
          
        </head>
        <body style="background-color:#0B0B0B;color:white;padding:32">
           <div style="font-weight:bold;font-size:24;color:rgba(86, 192, 90, 1)"> Dear ${transactionInfo[0].username}, </div>
           <span style="margin-bottom:48;">Your order payment with the transaction id of ${transactionInfo[0].id} has status of ${status}! </span>
           <span style="color:rgba(86, 192, 90, 1)">Thank you for ordering here!<span>
        </body>
        </html>`
    }

    if(transactionInfo[0].status != status ){
        transporter.sendMail(mailOptions, (err,info)=>{
            if(err) throw err

            console.log(`Email sent: ${info.response}`)

            return res.send({
                status:"Success",
                message: info.response
            })
        })
    }



}

module.exports = {notification,getAllTransactions,postTransaction};


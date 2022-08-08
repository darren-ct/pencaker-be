const Apply = require("../models/Apply");
const Job = require("../models/Job");
const User = require("../models/User");
const jwt = require("jsonwebtoken")

const sequelize = require("../config/connect");
const { QueryTypes } = require('sequelize');

const {sendErr} = require("../helper/other");
const {getMonth} = require("../helper/other");

var dateDifference = require('date-difference');


require("dotenv").config();

const getJobs = async(req,res) => {

    const position = req.query.position;

    // Find out token
    const bearer = req.headers.authorization;

    if(!bearer) return retreiveJobs(null,position,res)
       
  

    const token = bearer.split(" ")[1];
    jwt.verify(token ,process.env.SECRET, async(err,decoded)=>{
       if(err) return retreiveJobs(null,position,res)

       const userArr = await User.findAll({
              where: {
                     id : decoded.id
              }
       });

       if(userArr.length === 0) return retreiveJobs(null,position,res)
       

       const user = userArr[0];
      

       retreiveJobs(user.id,position,res)
    })

    

};

const retreiveJobs = async(userId,position,res) => {
    let query = null;

    // If user
    if(userId){

        if(!position) {
            query = `
           SELECT job.id AS job_id, position, location, salary_start, salary_end,
           DAY(job.createdAt) AS day, MONTH(job.createdAt) AS month , YEAR(job.createdAt) AS year,
           user.id AS user_id , user.name , user.email , user.image,
           apply.member_id AS isApplied
           FROM job INNER JOIN user
           ON job.company_id = user.id AND job.status = 'active'
           LEFT JOIN apply 
           ON job.id = apply.job_id AND apply.member_id = ${userId}
           `; 
          
          } else {
      
              query = `
              SELECT job.id AS job_id, position, location, salary_start, salary_end,
              DAY(job.createdAt) AS day, MONTH(job.createdAt) AS month , YEAR(job.createdAt) AS year,
              user.id AS user_id , user.name , user.email , user.image,
              apply.member_id AS isApplied
              FROM job INNER JOIN user
              ON job.company_id = user.id AND job.status = 'active' 
              LEFT JOIN apply 
              ON job.id = apply.job_id AND apply.member_id = ${userId}
              WHERE position LIKE '${position}%'
              `
          } 
    

    };

    // If no user
     if(!userId){

    if(!position) {
        query = `
       SELECT job.id AS job_id, position, location, salary_start, salary_end,
       DAY(job.createdAt) AS day, MONTH(job.createdAt) AS month , YEAR(job.createdAt) AS year,
       user.id AS user_id , user.name , user.email , user.image
       FROM job INNER JOIN user
       ON job.company_id = user.id AND job.status = 'active'
       `; 
      
      } else {
  
          query = `
          SELECT job.id AS job_id, position, location, salary_start, salary_end,
          DAY(job.createdAt) AS day, MONTH(job.createdAt) AS month , YEAR(job.createdAt) AS year,
          user.id AS user_id , user.name , user.email , user.image
          FROM job INNER JOIN user
          ON job.company_id = user.id AND job.status = 'active'
          WHERE position LIKE '${position}%'
          `
      } 

     }

      //  
      try {
          const result = await sequelize.query(
              query , {type:QueryTypes.SELECT}
           );
  
           const jobs = result.map(job => { return {
               id:job.job_id,
               position: job.position,
               location: job.location,
               salary_start : job.salary_start,
               salary_end : job.salary_end,
               post_at : `${job.day} ${getMonth(job.month)},${job.year}`,
               company : {
                  id : job.user_id,
                  name : job.name,
                  email : job.email,
                  image : job.image ? process.env.SERVER_URL + job.image : null
               },
               isApplied : job.isApplied ? true : false
           }});
  
           return res.status(201).send({
              status: "Success",
              jobs : jobs
           })
  
      } catch(err) {
           console.log(err)
           return sendErr('Server Error',res)
      }; 

    
}

const getJob = async(req,res) => {
    const jobId = req.params.id;

    // Find out token
    const bearer = req.headers.authorization;
    if(!bearer) return retreiveJob(null,jobId,res)
       
  

    const token = bearer.split(" ")[1];
    jwt.verify(token ,process.env.SECRET, async(err,decoded)=>{
       if(err) return retreiveJob(null,jobId,res)

       const userArr = await User.findAll({
              where: {
                     id : decoded.id
              }
       });

       if(userArr.length === 0) return retreiveJob(null,jobId,res)
       

       const user = userArr[0];

       retreiveJob(user.id,jobId,res)
    })



};

const retreiveJob = async(userId,jobId,res) => {
    let query = null;

    if(userId){
    
    query = `
    SELECT job.id AS job_id, position, location, salary_start, salary_end, description ,
    DAY(job.createdAt) AS day, MONTH(job.createdAt) AS month , YEAR(job.createdAt) AS year,
    user.id AS user_id , user.name , user.email, image,
    apply.member_id AS isApplied
    FROM job INNER JOIN user
    ON job.company_id = user.id AND job.id = ${jobId} AND job.status = 'active'
    LEFT JOIN apply 
    ON job.id = apply.job_id AND apply.member_id = ${userId}
        `

    };


    if(!userId){

    query = `
    SELECT job.id AS job_id, position, location, salary_start, salary_end, description ,
    DAY(job.createdAt) AS day, MONTH(job.createdAt) AS month , YEAR(job.createdAt) AS year,
    user.id AS user_id , user.name , user.email, image
    FROM job INNER JOIN user
    ON job.company_id = user.id AND job.id = ${jobId} AND job.status = 'active'
    `

    };



   try {
       const result = await sequelize.query(
           query , {type:QueryTypes.SELECT}
        );

       if(result.length === 0){
          return sendErr("No job found",res)
       };

       const job = result.map(job => { return {
           id:job.job_id,
           position: job.position,
           location: job.location,
           description:job.description,
           salary_start : job.salary_start,
           salary_end : job.salary_end,
           post_at : `${job.day} ${getMonth(job.month)},${job.year}`,
           company : {
              id : job.user_id,
              name : job.name,
              email : job.email
           },
           isApplied : job.isApplied ? true : false
       }})[0];

       return res.status(201).send({
           status: "Success",
           data : job
        });


   } catch(err) {
       return sendErr("Server error",res)
   };
}

const getMyJobs = async(req,res) => {
const id = req.user.id
const now = new Date();

const query = `
     SELECT job.company_id , job.id , job.position, job.status AS job_status, job.updatedAt,
     transaction.status AS transaction_status, COUNT(apply.member_id) AS personSubmitted
     FROM job LEFT JOIN transaction
     ON job.id = transaction.job_id AND job.company_id = ${id} 
     LEFT JOIN apply
     ON job.id = apply.job_id
     GROUP BY job.id
     
`;

    try {
  
        const result = await sequelize.query(
            query , {type:QueryTypes.SELECT}
         );
        const filteredResult = result.filter(item => item.company_id == id)


        const myJobs = filteredResult.map(job => {
            return {
                  id : job.id,
                  position: job.position,
                  transaction_status : !job.transaction_status ? "Not Paid" : job.transaction_status,
                  job_status : job.transaction_status === "pending" ? "pending" : job.job_status,
                  submitted : job.job_status === "active" ? `${job.personSubmitted} Person` : null,
                  duration : job.job_status === "active" ? `${dateDifference(job.updatedAt,now)} / 30 days` : null

            }
        });

        return res.status(201).send({
            status : "Success",
            jobs : myJobs
        })



    } catch(err) {
        console.log(err)
         sendErr("Server error",res)
    };

};

const getMyJob = async(req,res) => {

const userId = req.user.id
const jobId = req.params.id

const query = `
    SELECT user.name, user.email
    FROM job INNER JOIN apply
    ON job.id = apply.job_id AND job.id = ${jobId} AND job.company_id = ${userId}
    INNER JOIN user
    ON apply.member_id = user.id
`;
    
    try {
        
        const result = await sequelize.query(
            query , {type:QueryTypes.SELECT}
         );
        
        return res.status(201).send({
            status:"Success",
            applyers : result
        });
        
    } catch(err) {
        
        console.log(err)
         sendErr("Server error",res)
       
    };
    
 
    
    
}

const postJob = async(req,res) => {
    const companyId = req.user.id;
    const {position,location,description,salary_start,salary_end} = req.body;

    if(req.user.status !== "company"){
        return sendErr("Not a company",res)
    };
    

    try {

        // Filter
    if(position.length < 4) return sendErr("Position length  minimal 4 characters",res);
    if(location.length < 4) return sendErr("Location length  minimal 4 characters",res);
    if(description.length < 8) return sendErr("Description length  minimal 8 characters",res);
    if(salary_end < 0 || salary_start < 0) return sendErr("Salary can't be negative",res);
    if(salary_end < salary_start) return sendErr("Salary end must be bigger or the same from salary start",res);


        await Job.create({
             position,
             location,
             description,
             salary_start,
             salary_end,
             company_id:companyId,
             
        })

        return res.status(201).send({
            status:"Success"
        })

    } catch(err) {
        return sendErr("Server error",res)
    };
};

const applyJob = async(req,res) => {
    const userId = req.user.id;
    const{job_id} = req.body;

    if(req.user.status !== "member"){
        return sendErr("Not a member",res)
    };

    try {
        const job = await Job.findOne({
            where : {
                id:job_id
            },
            attributes : ["status"]
        });

        if(!job){
            return sendErr("Job not found",res)
        };

        if(job.status !== "active"){
            return sendErr("Job isnt active yet",res)
        }

        await Apply.create({
            member_id : userId,
            job_id 
        })

        return res.status(201).send({
            status:"Success"
        });
        
    } catch(err) {
        return sendErr("Server error",res)
    };

};

const getAppliedJobs = async(req,res) => {
    const myId = req.user.id;
    const query = `SELECT job.* 
    FROM job INNER JOIN apply
    ON job.id = apply.job_id AND apply.member_id = ${myId}
    `;
    
    try {
        
        const result = await sequelize.query(
            query , {type:QueryTypes.SELECT}
         );
        
        return res.status(201).send({
        status : "Success",
        jobs : result
        })
        
    } catch(err) {
          console.log(err);
          return sendErr("Server error",res)
    };
};

module.exports = {getJob,getJobs,postJob,applyJob,getMyJobs,getMyJob,getAppliedJobs}


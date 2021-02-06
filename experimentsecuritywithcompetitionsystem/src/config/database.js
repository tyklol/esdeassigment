const mysql = require('mysql');
const config = require('./config');
//To find out more on createPool:
//https://www.npmjs.com/package/mysql#pooling-connections

const pool = mysql.createPool({
        connectionLimit: 100,
        host: 'design-competition.ckqe4kb67goe.us-east-1.rds.amazonaws.com',
        user: 'admin',
        password: 'adminpassword',
        database: 'competition_system_security_concept_db',
        multipleStatements: true
    });

 module.exports=pool;
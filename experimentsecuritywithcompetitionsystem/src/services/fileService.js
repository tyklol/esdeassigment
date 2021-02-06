//Reference: https://cloudinary.com/documentation/node_integration
const cloudinary = require('cloudinary').v2;
const config = require('../config/config');
const pool = require('../config/database');
var validator = require('validator');
cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
    upload_preset: 'upload_to_design'
});

module.exports.uploadFile = (file, callback) => {
        console.log(file);

        // upload image here
        cloudinary.uploader.upload(file.path, { upload_preset: 'upload_to_design' })
            .then((result) => {
                //Inspect whether I can obtain the file storage id and the url from cloudinary
                //after a successful upload.
                //console.log({imageURL: result.url, publicId: result.public_id});
                let data = { imageURL: result.url, publicId: result.public_id, status: 'success' };
                callback(null, data);
                return;

            }).catch((error) => {

                let message = 'fail';
                callback(error, null);
                return;

            });

    } //End of uploadFile
module.exports.createFileData = (imageURL, publicId, userId, designTitle, designDescription) => {
        console.log('createFileData method is called.');
        return new Promise((resolve, reject) => {
            //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
            //to prepare the following code pattern which does not use callback technique (uses Promise technique)
            pool.getConnection((err, connection) => {
                if (err) {
                    console.log('Database connection error ', err);
                    resolve(err);
                } else {
                    console.log('Executing query');
                    /* let query = `INSERT INTO file ( cloudinary_file_id, cloudinary_url , 
                 design_title, design_description,created_by_id ) 
                 VALUES ('${publicId}','${imageURL}','${designTitle}','${designDescription}','${userId}') `; */
                     let query = `INSERT INTO file ( cloudinary_file_id, cloudinary_url , 
                    design_title, design_description,created_by_id ) 
                    VALUES (?,?,?,?,?) `;   

                    connection.query(query, [ publicId,imageURL, designTitle, designDescription,userId], (err, rows) => {
                        if (err) {
                            console.log('Error on query on creating record inside file table', err);
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                        connection.release();
                    });
                }
            });
        }); //End of new Promise object creation

    } //End of createFileData

module.exports.getFileData = (userId, pageNumber, search) => {
        
        console.log('getFileData method is called.');
        const page = pageNumber;
        if (search == null) { search = ''; };
        const limit = 4; //Due to lack of test files, I have set a 3 instead of larger number such as 10 records per page
        const offset = (page - 1) * limit;
        let designFileDataQuery = '';
        //If the user did not provide any search text, the search variable
        //should be null. The following console.log should output undefined.
        //console.log(search);
        //-------------- Code which does not use stored procedure -----------
        //Query for fetching data with page number and offset (and search)
        if ((search == '') || (search == null)) {
            console.log('Prepare query without search text');
            designFileDataQuery = `SELECT file_id,cloudinary_url,design_title,design_description 
        FROM file  WHERE created_by_id=${userId}  LIMIT ${limit} OFFSET ${offset};
        SET @total_records =(SELECT count(file_id) FROM file WHERE created_by_id= ${userId}   );SELECT @total_records total_records; `;
/*      Validate for only alphanumeric characters   
      }else if(validator.isAlphanumeric(search)){
            return new Promise.reject('Invalid Parameters'); */
        }else {//SQL INJECTION VULNERABILITY
            //Previous query
            /* designFileDataQuery = `SELECT file_id,cloudinary_url,design_title,design_description 
            FROM file  WHERE created_by_id=${userId} AND design_title LIKE '%${search}%'  LIMIT ${limit} OFFSET ${offset};
            SET @total_records =(SELECT count(file_id) FROM file WHERE created_by_id= ${userId} AND design_title LIKE '%${search}%' );SELECT @total_records total_records;`; */
            
            //New query
            designFileDataQuery = `CALL sp_get_paged_file_records(?,?,?,?); SELECT @total_records total_records;`;
        }
        //--------------------------------------------------------------------

        return new Promise((resolve, reject) => {
            //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
            //to prepare the following code pattern which does not use callback technique (uses Promise technique)
                pool.getConnection((err, connection) => {
                    if (err) {
                        console.log('Database connection error ', err);
                        resolve(err);
                    } else {
                        console.log(userId, search, offset, limit);
                        console.log('Executing query to obtain 1 page of 3 data');
                        connection.query(designFileDataQuery, [userId, '%'+search+'%', offset, limit], (err, results) => {
                            if (err) {
                                console.log('Error on query on reading data from the file table', err);
                                reject(err);
                            } else {
                                //The following code which access the SQL return value took 2 hours of trial
                                //and error.
                                console.log('Accessing total number of rows : ', results[2][0].total_records);
                                resolve(results);
                            }
                            connection.release();
                        });
                    }
                });
        }); //End of new Promise object creation

    } //End of getFileData
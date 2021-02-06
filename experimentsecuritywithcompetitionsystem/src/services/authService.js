config = require('../config/config');
const pool = require('../config/database')
module.exports.authenticate =   (email) => {
    return new Promise((resolve, reject) => {
        //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        //to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                resolve(err);

            } else {
                try {
                    connection.query(`SELECT user.user_id, fullname, email, user_password, role_name, user.role_id  
                   FROM user INNER JOIN role ON user.role_id=role.role_id AND email='${email}'`, {}, (err, rows) => {
                        if (err) {
                            reject(err);

                        } else {
                            if (rows.length == 1) {
                                console.log(rows);
                                resolve(rows);

                            } else {
                                reject(err);
                            }
                        }
                        connection.release();

                    });
                } catch (error) {
                    reject(err);
                }
            }
        }); //End of getConnection
    }); //End of new Promise object creation

    } //End of authenticate
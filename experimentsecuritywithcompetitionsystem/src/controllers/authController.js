const user = require('../services/userService');
const auth = require('../services/authService');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
exports.processLogin = async (req, res, next) => {

    let email = req.body.email;
    let password = req.body.password;
    var loginAttempt = {};
        try {
            let results = await auth.authenticate(email);

            if (results.length == 1) {
                if ((password == null) || (results[0] == null)) {
                    return res.status(500).json({ message: 'login failed' });
                }
                if (bcrypt.compareSync(password, results[0].user_password) == true) {
                    let data = {
                        user_id: results[0].user_id,
                        role_name: results[0].role_name,
                        token: jwt.sign({ id: results[0].user_id, role: results[0].role_name }, config.JWTKey, {
                            expiresIn: 86400 //Expires in 24 hrs
                        })
                    }; //End of data variable setup
                    // res.cookie('token',token,{maxAge:86400,httpOnly:false})
                    //res.setHeader('Set-Cookie',[' token='+token,'language=javascript',' Max-age=86400',' HttpOnly']);
                    console.log(data);
                    return res.status(200).json(data);
                } else {
                    let message = 'Login has failed';
                    // return res.status(500).json({ message: 'Login has failed.' });
                    return res.status(500).json({ message: message });
                } //End of passowrd comparison with the retrieved decoded password.
            } //End of checking if there are returned SQL results
        } catch (error) {
            let message = 'Credentials are not valid.';
            //return res.status(500).json({ message: message });
            //If the following statement replaces the above statement
            //to return a JSON response to the client, the SQLMap or
            //any attacker (who relies on the error) will be very happy
            //because they relies a lot on SQL error for designing how to do 
            //attack and anticipate how much "rewards" after the effort.
            //Rewards such as sabotage (seriously damage the data in database), 
            //data theft (grab and sell). 
            return res.status(500).json({ message: message });

        }



};

// If user submitted data, run the code in below
exports.processRegister = (req, res, next) => {
    console.log('processRegister running');
    let fullName = req.body.fullName;
    let email = req.body.email;
    let password = req.body.password;
    let message = 'Internal Serval Error';

    bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
            console.log('Error on hashing password');
            return res.status(500).json({ message: 'Unable to complete registration' });
        } else {
            try {
                results = await user.createUser(fullName, email, hash);
                console.log(results);
                message = 'Completed registration';
                return res.status(200).json({ message: message });
            } catch (error) {
                console.log('processRegister method : catch block section code is running');
                console.log(error, '=======================================================================');
                message ='Unable to complete registration';
                return res.status(500).json({ message: message });
            }
        }
    });


}; //End of processRegister
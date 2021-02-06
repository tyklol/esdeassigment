var validationFn={


    validatePassword: function (req, res, next) {
        var password = req.body.password.trim();
        //check that userid matches a valid number.
        var regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

        if (regex.test(password)) {
        next();
        } else {
            let message = 'Password error';
        res.status(400).json({message:'Password Error'});
        }


    }

}




module.exports=validationFn;
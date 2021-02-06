var emailValidationFn={


    validateEmail: function (req, res, next) {
        var emailInput = req.body.email.trim();
        //check that userid matches a valid number.
        var regex = new RegExp(`^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,4}$`);
        if (regex.test(emailInput)) {
        next();
        } else {
            console.log("Invalid Email");
            let message = 'Email error';
        res.status(400).json({message:message});
        }


    }

}




module.exports=emailValidationFn;
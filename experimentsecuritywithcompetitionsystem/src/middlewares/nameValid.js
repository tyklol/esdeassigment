var validName={


    validateName: function (req, res, next) {
        var name = req.body.fullName.trim();
        //check that userid matches a valid number.
        var regex = new RegExp("^[\\w\\s]{8,16}$");

        if (regex.test(name)) {
        next();
        } else {
            console.log("Invalid Name");
            let message = 'Name error';
        res.status(400).json({message:message});

        }
    }

}




module.exports=validName;
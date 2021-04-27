const { response } = require("express");
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const {generateJWT} = require('../helpers/jwt');

const AuthService = {
    login: async (req, res = response) => {
        const { email, password } = req.body;

        try {
            //Validate email
            const dbUser = await User.findOne({email});
            if(!dbUser){
                return res.status(400).json({
                    ok: false,
                    msg: "Invalid credentials"
                });
            }

            //Confirm password
            const validPassword = bcrypt.compareSync(password, dbUser.password);
            if(!validPassword){
                return res.status(400).json({
                    ok: false,
                    msg: "Invalid credentials"
                });
            }

            //Generate JWT
            const token = await generateJWT(dbUser.id, dbUser.name);

            //Response all ok
            return res.json({
                ok: true,
                uid: dbUser.id,
                name: dbUser.name,
                token
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: "An error has occurred, please contact admin"
            });
        } 
    
    },

    register: async (req, res = response) => {
        const { name, email, password } = req.body;

        try {

            //Validate email
            let user = await User.findOne({email});
            if(user){
                return res.status(500).json({
                    ok: false,
                    msg: "This email already exist, please log in"
                })
            }

            //Create user 
            const dbUser = new User(req.body);

            //Hash password
            const salt = bcrypt.genSaltSync(10);
            dbUser.password = bcrypt.hashSync(password, salt);

            //Generate jwt
            const token = await generateJWT( dbUser.id, name);

            //Create and Save user
            await dbUser.save();

            //Response
            return res.status(200).json({
                ok: true,
                uid: dbUser.id,
                name,
                token
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: "An error has occurred, please contact admin"
            });
        }
    },

    renew: async (req, res = response) => {

        const {uid, name} = req;

        const token = await generateJWT(uid, name);

        return res.json({
            status: "ok",
            uid,
            name,
            token
        });
    },
};

module.exports = AuthService;

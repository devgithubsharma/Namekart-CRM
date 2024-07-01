const dbConnection = require('../dbConnection'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req,res) => {
    const loginIdentifier = req.body.login; // Can be either username or email
    const password = req.body.password;
    console.log("loginIdentifier",loginIdentifier)
    let connection;
    try{
        // console.log("loginIdentifier",loginIdentifier)
        connection = await dbConnection.getConnection();
        console.log("Connection",connection)

        const query = 'SELECT * FROM users_crm WHERE user_email = ?';
        connection.query(query, [loginIdentifier], async (err,result)=>{
            if(err){
                console.log('Error in login query', err)
            }else if(result.length>0){
                const comparison = await bcrypt.compare(password, result[0].user_password);
                if(comparison){
                    const user = { id: result[0].user_id }; // Payload
                    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
                    res.status(200).send({ token });
                }
            }else{
                res.status(401).send('Invalid credentials');
            }
        });

    }catch(err){
        console.log("Error in Login",err)
        res.status(500).send('Error logging user');
    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {
    login,
}
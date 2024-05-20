const dbConnection = require('../dbConnection'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req,res) => {
    const loginIdentifier = req.body.login; // Can be either username or email
    const password = req.body.password;

    try{
        const connection = await dbConnection.getConnection();

        const query = 'SELECT * FROM users WHERE user_name = ? OR user_email = ?';
        connection.query(query, [loginIdentifier, loginIdentifier], async (err,result)=>{
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
        })
    }catch(err){
        res.status(500).send('Error logging user');
    }
}

module.exports = {
    login,
}
const dbConnection = require('../dbConnection'); 
const bcrypt = require('bcrypt');

const signUp = async (req,res) => {
    try{
        const connection = await dbConnection.getConnection();
        const { username, email, password } = req.body;
        const checkSql = 'SELECT * FROM users_crm WHERE user_name = ? OR user_email = ?';
        
        connection.query(checkSql,[username,email], async (err,result)=>{
            if(err){
                console.log('Error in signup query', err)
            }else if(result.length>0){
                res.status(409).send('Username or email already in use');
            }else{
                const hashedPassword = await bcrypt.hash(password, 10);
                const insertSql = 'INSERT INTO users_crm (user_name, user_email, user_password) VALUES (?, ?, ?)';
                
                connection.query(insertSql, [username, email, hashedPassword], (insertErr) =>{
                    if(insertErr){
                        console.log('Error in signUp insert', insertErr)
                    }else{
                        res.status(201).send('User registered');
                    }
                })
            }
        })
    }catch(err){
        res.status(500).send('Error registering user');
    }
}

module.exports = {
    signUp,
}
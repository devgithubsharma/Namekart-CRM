const dbConnection = require('../dbConnection');
const {google} = require('googleapis');


const addEmails = async (req,res)=>{
    const  emails = req.body.email;
    const name = req.body.name;
    const accessToken = req.body.accessToken;
    const refreshToken = req.body.refreshToken
    // const user_id = 'dev@namekart.com';
    const userId = req.body.userId
    let connection;
    
    try{

        connection = await dbConnection.getConnection();
        query = 'INSERT into sendertable (sender_email_id, user_id, refreshToken, sender_name, accessToken) VALUES (?,?,?,?,?)';

        await connection.query(query,[emails, userId, refreshToken, name, accessToken],(error,result)=>{
            if(error){

                console.log('Error in sendertable query', error)
                res.status(500).json({ error: 'Internal Server Error' });

            }else{
                console.log("result", result)
                res.status(200).json({ message: 'Email created successfully',sender_id: result.insertId });
            }
        })

    }catch(err){
        console.error('Error in creating Sender Table', err.message)
        if(connection){
            connection.release();
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports ={
    addEmails,
}
const dbConnection = require('../dbConnection');
const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.Client_ID,
    process.env.Client_secret,
    process.env.REDIRECT_URI 
  );

const addEmails = async (req,res)=>{
    const  emails = req.body.email;
    const name = req.body.name;
    const token = req.body.accessToken;
    const user_id = 'dev@namekart.com';
    let connection;
    try{

        connection = await dbConnection.getConnection();
        query = 'INSERT into sendertable (sender_email_id,user_id, refreshToken, sender_name) VALUES (?,?,?,?)';

        await connection.query(query,[emails,user_id,token,name],(error,result)=>{
            if(error){

                console.log('Error in sendertable query', error)
                res.status(500).json({ error: 'Internal Server Error' });

            }else{
                connection.release();
                // const authUrl = oauth2Client.generateAuthUrl({
                //     access_type: 'offline',
                //     scope: ['https://www.googleapis.com/auth/gmail.send'],
                //     state: encodeURIComponent(JSON.stringify({user_id, email: emails})),
                // });

                res.status(200).json({ message: 'Email created successfully',sender_id: result.insertId });
            }
        })

    }catch(err){
        console.error('Error in creating Sender Table', err.message)
        if(connection){
            connection.release();
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports ={
    addEmails,
}
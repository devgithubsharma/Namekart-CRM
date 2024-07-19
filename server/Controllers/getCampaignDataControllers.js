const dbConnection = require('../dbConnection');

const getCampaignData = async (req,res) =>{
    const userId = req.params.userId
    let connection;
    try{
        connection = await dbConnection.getConnection();
        console.log('Connection 2')
        const userQuery = 'Select camp_id, camp_name, title_id, tags_id from camptable where userId=?';
        await connection.query(userQuery,[userId], (err,result) =>{
            if(err){
                console.log(err)
                res.status(500).json({error: 'Internal Server Error'})
            }else{
            
                res.status(201).json({result})
            }
        })

    }catch(err){
        
        res.status(500).send("Error fetching Campaign Data");
        
    }finally{
        if(connection){
            connection.release();
        }
    }
}
 
module.exports = {
    getCampaignData,
}
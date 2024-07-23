const dbConnection = require('../dbConnection');

const getCampaignData = async (req,res) =>{
    const userId = req.params.userId
    let connection;
    try{
        connection = await dbConnection.getConnection();
        const userQuery = `
            SELECT camp_id, camp_name, title_id, camp_type, (
            SELECT tags_id
            FROM titles_tags
            WHERE camptable.title_id = titles_tags.title_id
            LIMIT 1
            ) AS tags_id
            FROM camptable
            WHERE userId = ?
        `;
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
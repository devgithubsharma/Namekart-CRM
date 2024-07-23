const dbConnection = require('../dbConnection');

const getFilteredCampaignData = async (req,res) =>{
    const selectedCampaignType = req.params.selectedCampaignType;
    const userId = req.params.userId
    let connection;
    try{
        console.log('Connection 1')
        connection = await dbConnection.getConnection();
        console.log('Connection 2')
        const userQuery = `
            SELECT camp_id, camp_name, title_id, camp_type, (
            SELECT tags_id
            FROM titles_tags
            WHERE camptable.title_id = titles_tags.title_id
            LIMIT 1
            ) AS tags_id
            FROM camptable
            WHERE camp_type = ? AND userId = ?
        `;      
        await connection.query(userQuery,[selectedCampaignType,userId], (err,result) =>{
            if(err){
                console.log(err)
                res.status(500).json({error: 'Internal Server Error'})
            }else{
            //    console.log(result)
                connection.release();
                res.status(201).json({result})
            }
        })

    }catch(err){
        if(connection){
            connection.release();
        }
        res.status(500).send("Error fetching Campaign Data");
        
    }
}
 
module.exports = {
    getFilteredCampaignData,
}
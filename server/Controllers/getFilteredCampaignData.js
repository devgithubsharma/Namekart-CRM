const dbConnection = require('../dbConnection');

const getFilteredCampaignData = async (req,res) =>{
    const selectedCampaignType = req.params.selectedCampaignType;
    let connection;
    try{
        console.log('Connection 1')
        connection = await dbConnection.getConnection();
        console.log('Connection 2')
        const userQuery = 'Select camp_id, camp_name, title_id, camp_type from camptable where camp_type=?';
        await connection.query(userQuery,[selectedCampaignType], (err,result) =>{
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
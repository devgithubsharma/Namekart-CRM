const dbConnection = require('../dbConnection');

const campaignsData = async (req,res) =>{
    const campName = req.body.campaignName;
    // const tagName = req.body.tagName;
    const tagId = req.body.titleId;
    const userId = req.body.userId
    console.log(campName,)
    let connection;

    
    try{

        connection = await dbConnection.getConnection();
        const userQuery = 'INSERT into camptable (camp_name, title_id, camp_type,userId) VALUES (?,?,?,?)';
        await connection.query(userQuery,[campName,tagId, 'manual',userId],(error,result) =>{
            if(error){
                console.log('Error in campaignData query', error)
                res.status(500).json({ error: 'Internal Server Error' });
            }else{
                console.log('Campaign Data',result)
                connection.release();
                res.status(200).json({ message: 'Campaign created successfully',camp_id: result.insertId });
            }
        })
        
    }catch(err){
        console.error('Error in creating Campaign Table', err.message)
        connection.release()
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    campaignsData,
}
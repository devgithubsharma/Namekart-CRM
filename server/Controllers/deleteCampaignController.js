const dbConnection = require('../dbConnection');

const deleteCampaign = async (req,res) =>{
    const campId = req.body.campId;
    let connection;
    
    try{
        connection = await dbConnection.getConnection();
        const userQuery = 'DELETE FROM camptable WHERE camp_id = ?'
        const response = await connection.query(userQuery,[campId])
        if(response.affectedRows === 0){
            return res.status(404).json({ message: 'Campaign not found' });
        }
        connection.release();
        res.status(200).json({ message: 'Campaign deleted successfully' });
    }catch(err){
        if(connection){
            connection.release()
        }
        res.status(500).send("Error in delete Campaign Data");
    }
}

module.exports = {
    deleteCampaign,
}

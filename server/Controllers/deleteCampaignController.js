const dbConnection = require('../dbConnection');

const deleteCampaign = async (req,res) =>{
    const campId = req.body.campId;
    let connection;
    console.log("campId",campId);
    try{
        connection = await dbConnection.getConnection();
        const userQuery = 'DELETE FROM camptable WHERE camp_id = ?'
        connection.query(userQuery,[campId],(err,result)=>{
            if(err){
                console.log("Error in userQuery",err)
            }else{
                if(result.affectedRows === 0){
                    res.status(404).json({ message: 'Campaign not found' });
                }
                else{
                    res.status(200).json({ message: 'Campaign deleted successfully' });
                }
            }
        })
       
    }catch(err){
        
        res.status(500).send("Error in delete Campaign Data");
    }finally{
        if(connection){
            connection.release()
        }
    }
}

module.exports = {
    deleteCampaign,
}

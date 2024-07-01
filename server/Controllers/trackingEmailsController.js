const dbConnection = require('../dbConnection'); 

const trackingEmails = async (req,res) =>{
    const trackingId = req.query.trackingId;
    const campId = req.query.campId;
    console.log('Tracking Pixel Hits',trackingId)
    let connection;
    
    try{
        connection = await dbConnection.getConnection();
        const query = 'UPDATE emailsdata SET trackingStatus = ? WHERE trackingId = ? and campId = ?';
        connection.query(query, ['open',trackingId,campId], (err,result) =>{
            if(err){
                console.log('Error in tracking email query')
            }else{
                console.log(result)
                res.json({result})
            }
        })
    }catch(err){
        console.log('Error in tracking emails',err)
        res.status(500).send({ error: 'Internal Server Error' });
    }finally{
        if(connection){
            connection.release();
        }
    }

}

module.exports = {
    trackingEmails,
}

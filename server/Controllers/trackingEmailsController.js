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
                connection.release();
                res.json({result})
            }
        })
    }catch(err){
        console.log('Error in tracking emails',err)
        if(connection){
            connection.release();
        }
        res.status(500).send({ error: 'Internal Server Error' });
    }

}

module.exports = {
    trackingEmails,
}

const dbConnection = require('../dbConnection'); 

const getSequenceDetails = async (req,res) =>{
    // const sequenceId = req.params.activeSequenceTab;
    let connection;

    try{
        connection = await dbConnection.getConnection();
        const query = 'SELECT s.sequence_id, s.sequence_name, st.step_id, st.subject, st.pretext, st.body, st.delay FROM sequences s JOIN steps st ON s.sequence_id = st.sequenceId';

        await connection.query(query, (err,result) =>{
            if(err){
                console.error('Error fetching sequence details:', err);
            }else{
                
                res.json({result})
            }
        })
    }catch(err){
            console.log(err)
            res.status(500).send('Error in getting sequence details')
    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {
    getSequenceDetails,
}
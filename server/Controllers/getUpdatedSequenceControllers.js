const dbConnection = require('../dbConnection'); 

const getUpdatedSequence = async (req,res) =>{
    const seqId = req.params.sequenceId
    console.log("seqId in getUpdatedSequence", seqId)
    let connection;

    try{
        connection = await dbConnection.getConnection();
        const query = 'SELECT s.sequence_id, s.sequence_name, st.step_id, st.subject, st.pretext, st.body, st.delay FROM sequences s JOIN steps st ON s.sequence_id = st.sequenceId WHERE s.sequence_id = ?';

        await connection.query(query, [seqId], (err, result) => {
            if (err) {
                console.error('Error fetching sequence details:', err);
                res.status(500).send('Error fetching sequence details');
            } else {
                console.log("result",result);
                res.status(200).json(result);
            }
        });

    }catch(err){
        console.log("Error in getUpdatedSequence",err)
        res.status(500).send('Error fetching sequence details');
    }
}

module.exports = {
    getUpdatedSequence,
}
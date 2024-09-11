const dbConnection = require('../dbConnection'); 

const getSequenceIds = async (userId,connection) =>{
    console.log("userId", userId)
    let sequenceIds;
    try{
        return new Promise((resolve, reject)=>{
            const sequenceQuery = 'SELECT sequence_id FROM sequences WHERE userId = ?';
            connection.query(sequenceQuery, [userId], (err, result) => {
                if(err){
                    console.log("Error in fetching sequenceIds", err)
                    reject(err);
                }else if(result.length> 0){
                    sequenceIds = result.map(seq => seq.sequence_id);
                    resolve(sequenceIds);
                }else{
                    console.log(`No sequenceIds found for ${userId}`);
                    resolve([]);
                }
            })
        })
    }catch(err){
        console.log(err)
        throw err;
    }
}

const getSequenceDetails = async (req,res) =>{
    const userId = req.params.userId;
    console.log("userId", userId)
    let connection;

    try{
        connection = await dbConnection.getConnection();
        
        // const sequenceQuery = 'SELECT sequence_id FROM sequences WHERE userId = ?';
        
        // await connection.query(sequenceQuery, [userId], (err, result) => {
        //     if(err){
        //         console.error('Error fetching sequence details:', err);
        //     }else{
        //         console.log("result", result)
        //         sequenceIds = result.map(seq => seq.sequence_id);
        //         console.log("sequenceIds", sequenceIds)
        //     }
        // })
        
        const sequenceIds = await getSequenceIds(userId, connection);
        console.log("sequenceIds", sequenceIds);
        
        // const query = 'SELECT s.sequence_id, s.sequence_name, st.step_id, st.subject, st.pretext, st.body, st.delay FROM sequences s JOIN steps st ON s.sequence_id = st.sequenceId';
        const stepsQuery = `
        SELECT s.sequence_id, s.sequence_name, st.step_id, st.subject, st.pretext, st.body, st.delay 
        FROM sequences s 
        JOIN steps st ON s.sequence_id = st.sequenceId 
        WHERE s.sequence_id IN (?)`;
        await connection.query(stepsQuery, [sequenceIds], (err,result) =>{
            if(err){
                console.error('Error fetching sequence details:', err);
            }else{
                console.log("result", result);
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
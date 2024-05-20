const dbConnection = require('../dbConnection');

const updateSequnceDetails = async (req,res) =>{
    const { sequenceId, sequenceName, steps } = req.body;
    const connection = await dbConnection.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query('UPDATE sequences SET sequence_name = ? WHERE sequence_id = ?', [sequenceName, sequenceId], (err,result) =>{
            if(err){
                console.log('Error in updating sequences',err) 
            }else{
                console.log(result)
                res.json({result})
            }
        });
    
        for (const step of steps) {
          if (step.step_id) {
            await connection.query('UPDATE steps SET subject = ?, pretext = ?, body = ?, delay = ? WHERE step_id = ? AND sequenceId = ?',
              [step.subject, step.pretext, step.body, step.delay, step.step_id, sequenceId]);

          } else {
            await connection.query('INSERT INTO steps (sequenceId, subject, pretext, body, delay) VALUES (?, ?, ?, ?, ?)',
              [sequenceId, step.subject, step.pretext, step.body, step.delay]);
          }
        }
    
        await connection.commit();
        res.send({ success: true, message: 'Sequence and its steps updated successfully' });

      } catch (error) {
        await connection.rollback();
        console.error('Error updating sequence and steps:', error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });

      } finally {
        connection.release();
      }

}

module.exports = {
    updateSequnceDetails,
}
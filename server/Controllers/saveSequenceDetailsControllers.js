const dbConnection = require('../dbConnection'); 
const cheerio = require('cheerio');

const saveSequenceDetails = async (req,res) =>{

    const extractTextFromBody = (htmlBody) => {
        const $ = cheerio.load(htmlBody);
        return $.text();
    };

    const { sequenceName, campaignId, isNew, steps } = req.body;
    let connection;
    try{
        connection = await dbConnection.getConnection();
        await connection.beginTransaction(err => {
            if (err) { throw err; }
    
            const insertSequenceQuery = 'INSERT INTO sequences ( sequence_name, campaign_id, isNew) VALUES (?, ?, ?)';
             connection.query(insertSequenceQuery, [ sequenceName, campaignId, isNew], (error, results) => {
                if (error) {
                    return connection.rollback(() => {
                        connection.release();
                        throw error;
                    });
                }
    
                const newSequenceId = results.insertId
                const insertStepQuery = 'INSERT INTO steps (sequenceId, subject, pretext, body, delay) VALUES ?';
                const stepValues = steps.map(step => [results.insertId, step.subject, step.pretext, step.body, step.delay]);
    
                connection.query(insertStepQuery, [stepValues], (error, results) => {
                    if (error) {
                        return connection.rollback(() => {
                            connection.release();
                            throw error;
                        });
                    }
    
                    // Commit the transaction
                    connection.commit(err => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                throw err;
                            });
                        }
                        console.log('Transaction Complete.');
                        connection.release(); 
                        res.send({ success: true, message: 'Sequence and its steps saved successfully', sequenceId: newSequenceId });
                    });
                });
            });
        });

    }catch(err){
        console.log('Error in Saving sequence details', err)
        if (connection) connection.release(); // Ensure connection is released on catching any errors
        res.status(500).send('Error in Saving sequence details');
    }
}

module.exports = {
    saveSequenceDetails
}
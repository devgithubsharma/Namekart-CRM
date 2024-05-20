const dbConnection = require('../dbConnection'); 
const lastFetchedIdStorage = require('../Controllers/lastFetchedId'); // Update the path accordingly

const getEmails = async (req,res)=>{
    
    // let lastFetchedId = 0;
    let connection;
    try{
        console.log('get emails is getting executed')
        connection = await dbConnection.getConnection();

        const lastFetchedId = lastFetchedIdStorage.getLastFetchedId();
        const query = 'SELECT emails, lists_data_id FROM listsdata WHERE lists_data_id > ?';
        await connection.query(query, [lastFetchedId],(err,result)=>{
            if(err){
                console.log('Error in row', err)
            }else{
                console.log('Rows result', result)
                connection.release()
                const emails = result.map(({ emails }) => emails);
                
                        // Update the last fetched ID
                if (result.length > 0) {
                    const newLastFetchedId = result[result.length - 1].lists_data_id;
                    lastFetchedIdStorage.setLastFetchedId(newLastFetchedId);
                }
                res.json({ emails });
            }
        });

    }catch(err){
        console.error('Error fetching emails:', err);
        if(connection){
            connection.release();
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    getEmails,
}
const dbConnection = require('../dbConnection'); 

async function updateBouncedMails(messageId) {
    let connection;
    
    try{
        connection = await dbConnection.getConnection();
        return new Promise((resolve, reject) => {
            const query = 'UPDATE emailsdata SET mailBounced = ? WHERE messageId = ?';
            connection.query(query, ['Bounce',messageId], (error, results) => {
                if (error) { 
                    console.error('Error updating sent email count:', error);
                    reject(error);
                } else {
                    console.log('Sent email count updated for campaign ID');
                    resolve(results); 
                }
        });
    }).finally(() => {
        // Release the connection back to the pool
        connection.release();
    });
    }catch(err){
        console.error('Failed to get database connection:', err);
        if (connection) connection.release();
        throw err; // Re-throw the error after releasing the connection

    }
   
}

module.exports = {
    updateBouncedMails,
}
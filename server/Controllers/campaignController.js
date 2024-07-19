const dbConnection = require('../dbConnection');

const campaignsData = async (req, res) => {
    const campName = req.body.campaignName;
    const tags_id = req.body.tags_id;
    const tagId = req.body.titleIds[0];
    const userId = req.body.userId
    console.log(campName,)
    let connection;


    try {
        connection = await dbConnection.getConnection();
        const userQuery = 'INSERT into camptable (camp_name, title_id, camp_type,userId,tags_id) VALUES (?,?,?,?,?)';
        await connection.query(userQuery, [campName, tagId, 'manual', userId, tags_id], (error, result) => {
            if (error) {
                console.log('Error in campaignData query', error)
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('Campaign Data', result)
                connection.release();
                res.status(200).json({ message: 'Campaign created successfully', camp_id: result.insertId });
            }
        })

    } catch (err) {
        console.error('Error in creating Campaign Table', err.message)
        connection.release()
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    campaignsData,
}
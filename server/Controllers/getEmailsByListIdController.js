const dbConnection = require('../dbConnection');

const getEmailsById = async (req, res) => {
    const tags_id = req.params.tags_id;
    const userId = req.params.userId;
    let connection;

    try {
        connection = await dbConnection.getConnection();
        const query = `
            SELECT listsdata.emails, listsdata.domains, listsdata.leads, listsdata.names, listsdata.links 
            FROM listsdata 
            INNER JOIN titledata ON listsdata.title_id = titledata.title_id
            INNER JOIN titles_tags ON titledata.title_id = titles_tags.title_id
            INNER JOIN tagsdata ON titles_tags.tags_id = tagsdata.tags_id
            WHERE tagsdata.tags_id = ? AND tagsdata.userId = ?;
        `;

        connection.query(query, [tags_id, userId], (err, result) => {
            if (err) {
                console.error('Error fetching emails:', err);
                res.status(500).send('Error fetching emails');
            } else {
                res.json({
                    emails: result.map(row => row.emails),
                    domains: result.map(row => row.domains),
                    leads: result.map(row => row.leads),
                    names: result.map(row => row.names),
                    links: result.map(row => row.links)
                });
            }
        });
    } catch (err) {
        console.error('Error in getting Emails by tagsId Controllers', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    getEmailsById,
}

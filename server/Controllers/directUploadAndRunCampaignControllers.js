const dbConnection = require('../dbConnection');

// function to get or insert title and return titleId
const getTitleId = async (title, userId, connection) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT title_id FROM titledata WHERE title = ? AND userId = ?';
        connection.query(query, [title, userId], (error, titleResult) => {
            if (error) {
                return reject(error);
            }

            if (titleResult.length > 0) {
                resolve(titleResult[0].title_id);
            } else {
                const insertTitleQuery = 'INSERT INTO titledata (title, userId) VALUES (?, ?)';
                connection.query(insertTitleQuery, [title, userId], (insertError, insertResult) => {
                    if (insertError) {
                        return reject(insertError);
                    }
                    resolve(insertResult.insertId);
                });
            }
        });
    });
};

// function to get or insert tag and return tagId
const getTagId = async (tag, userId, connection) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT tags_id FROM tagsdata WHERE tags = ? AND userId = ?';
        connection.query(query, [tag, userId], (error, tagResult) => {
            if (error) {
                return reject(error);
            }

            if (tagResult.length > 0) {
                resolve(tagResult[0].tags_id);
            } else {
                const insertQuery = 'INSERT INTO tagsdata (tags, userId) VALUES (?, ?)';
                connection.query(insertQuery, [tag, userId], (insertError, insertResult) => {
                    if (insertError) {
                        return reject(insertError);
                    }
                    resolve(insertResult.insertId);
                });
            }
        });
    });
};

// function to check and insert relationship between title and tag
const checkAndInsertRelationship = async (titleId, tagId, connection) => {
    return new Promise((resolve, reject) => {
        const relationshipQuery = 'SELECT * FROM titles_tags WHERE title_id = ? AND tags_id = ?';
        connection.query(relationshipQuery, [titleId, tagId], (relationshipError, relationshipResult) => {
            if (relationshipError) {
                return reject(relationshipError);
            }

            if (relationshipResult.length > 0) {
                resolve();
            } else {
                const insertRelationshipQuery = 'INSERT INTO titles_tags (title_id, tags_id) VALUES (?, ?)';
                connection.query(insertRelationshipQuery, [titleId, tagId], (insertRelationshipError) => {
                    if (insertRelationshipError) {
                        return reject(insertRelationshipError);
                    }
                    resolve();
                });
            }
        });
    });
};

// Main function to upload contacts from dashboard
const uploadContactsFromDashboard = async (req, res) => {
    const title = req.body.titleId;
    const tag = req.body.tag;
    const csvValues = req.body.csvValues;
    const userId = req.body.userId;
    const csvColumns = csvValues[0];

    let connection;

    try {
        connection = await dbConnection.getConnection();

        const titleId = await getTitleId(title, userId, connection);
        const tagId = await getTagId(tag, userId, connection);
        await checkAndInsertRelationship(titleId, tagId, connection);

        const csvCleanedValues = csvValues.map(row => Object.values(row).map(cell => cell.trim()));
        const cleanedCsvColumns = Object.keys(csvColumns).map(key => key.replace(/\r/g, ''));
        const cleanedCsvValues = csvCleanedValues.map(row => row.map(cell => cell.replace(/\r/g, '')));

        const mapColumns = (csvColumns) => {
            const columnMap = {
                'domain': 'domains',
                'lead': 'leads',
                'name': 'names',
                'email': 'emails',
                'links': 'links'
            };
            const lowercaseColumns = csvColumns.map(column => column.toLowerCase().trim());
            return lowercaseColumns.map(column => columnMap[column]).filter(Boolean);
        };

        const isValidData = cleanedCsvValues.every(row => row.length === cleanedCsvColumns.length);
        if (!isValidData) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const dbColumns = mapColumns(cleanedCsvColumns);
        const columnNames = ['title_id', 'userId', ...dbColumns].join(', ');
        const placeholders = cleanedCsvValues.map(row => `(${new Array(row.length + 2).fill('?').join(', ')})`).join(', ');

        const query = `INSERT INTO listsdata (${columnNames}) VALUES ${placeholders}`;
        const flatValues = cleanedCsvValues.reduce((acc, row) => [...acc, titleId, userId, ...row], []);
        
        await connection.query(query, flatValues, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            res.json({ message: 'Contacts uploaded successfully', listDataId: result.insertId });
        });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    uploadContactsFromDashboard,
    getTitleId,
    getTagId,
    checkAndInsertRelationship
};

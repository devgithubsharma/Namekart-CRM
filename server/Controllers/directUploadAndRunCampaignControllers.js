const dbConnection = require('../dbConnection'); 

function createTitle(title, userId,connection) {
    return new Promise((resolve, reject) => {
        try {
            const insertQuery = 'INSERT INTO titledata (title,userId) VALUES (?,?)';
            connection.query(insertQuery, [title,userId], (err, result) => {
                if (err) {
                    console.error('Error creating list:', err);
                    reject(err);
                } else {
                    console.log('List created with ID:', result.insertId);
                    resolve(result.insertId);  // Resolve with the insertId
                }
            });
        } catch (error) {
            console.error('Error in createList:', error);
            reject(error);
        }
    });
}

function addTag(titleId, tags, userId, connection) {
    return new Promise((resolve, reject) => {
        try {
            const query = 'INSERT into tagsdata (title_id, tags, userId) VALUES (?, ?, ?)';
            connection.query(query, [titleId, tags, userId], (error, result) => {
                if (error) {
                    console.error('Error in tagsdata query', error);
                    reject({ status: 500, message: 'Internal Server Error', error: error });
                } else {
                    console.log('tag result', result);
                    resolve({ status: 200, message: 'Tag added successfully', tagIds: result.insertId });
                }
            });
        } catch (err) {
            console.error('Error in creating tags Table', err.message);
            reject({ status: 500, message: 'Internal Server Error', error: err });
        }
    });
}

function checkTagAndReturnTitleId(tag, userId, connection) {
    return new Promise(async (resolve, reject) => {
        try {
            const tagExistsQuery = 'SELECT * FROM tagsdata WHERE tags = ? AND userId = ?';
            await connection.query(tagExistsQuery, [tag, userId], (err,result)=>{
                if(err){
                    console.log("Error in checkTagAndReturnTitleId query",err)
                }else{
                    if (result.length > 0) {
                        resolve(result[0].title_id); 
                    } else {
                        resolve(null); 
                    }
                }
                
            })
            
        } catch (error) {
            console.error('Error checking tag:', error);
            reject(error);
        }
    });
}


const uploadContactsFromDashboard = async (req,res)=>{
    const titleId = req.body.titleId;
    const tags = req.body.tag
    const csvData = req.body.csvValues;
    const userId = req.body.userId
    const csvColumns = csvData[0]

    console.log("csvData",csvData)
    console.log("csvColumns",csvColumns)
    console.log("titleId",titleId)
    console.log("userId",userId)


    let connection;

    try{
    connection = await dbConnection.getConnection();

    const csvValues = csvData.map(row => Object.values(row).map(cell => cell.trim()));
    const cleanedCsvColumns = Object.keys(csvColumns).map(key => key.replace(/\r/g, ''));
    const cleanedCsvValues = csvValues.map(row => row.map(cell => cell.replace(/\r/g, '')));

     const existingTitleId = await checkTagAndReturnTitleId(tags,userId,connection);
     let title_Id;
     if(existingTitleId){
        title_Id = existingTitleId;
     }else{
        title_Id = await createTitle(titleId, userId, connection)
        await addTag(title_Id, tags, userId, connection)
     }
      

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


    // Assuming you have a 'listdata' table with columns: list_id, domain, lead, name, email
    const query = `INSERT INTO listsdata (${columnNames}) VALUES ${placeholders}`;
    console.log(query);

    const flatValues = cleanedCsvValues.reduce((acc, row) => [...acc, title_Id, userId, ...row], []);
    await connection.query(query, flatValues, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        return res.json({ message: 'Contacts uploaded successfully', listDataId: result.insertId });
    });
   
    }catch(error){

        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });

    }finally{
        if(connection){
            connection.release();
        }
    }

}

module.exports = {
    uploadContactsFromDashboard,
  };

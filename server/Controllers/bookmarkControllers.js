const dbConnection = require('../dbConnection');

const formatDate = (receivedTime) => {
  const date = new Date(receivedTime);
  const now = new Date();

  const istDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  const formattedDate = istDate.format(date);
  const formattedNow = istDate.format(now);

  const isToday = formattedDate.split(' ')[0] === formattedNow.split(' ')[0];

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedYesterday = istDate.format(yesterday);
  const isYesterday = formattedYesterday.split(' ')[0] === formattedNow.split(' ')[0];

  const year = date.getFullYear() === now.getFullYear() ? '' : date.getFullYear();

  if (isToday) {
    return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', hour12: true });
  } else if (isYesterday) {
    return 'Yesterday';
  } else {
    return `${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}${year ? year : ''}`;
  }
};

const getBookmarkedMails = async (params) => {
  let connection = await dbConnection.getConnection();
  const userId = params.emailAccount;
  const camp_type = "manual";
  const { searchTerm, startDate, endDate, emailStatus, sortingOptions, rowsPerPage, currentPage } = params;

  let queryParams = [camp_type, 1, userId];

  let baseQuery = `
      FROM emailsdata e
      JOIN (
        SELECT threadId, MAX(IFNULL(receivedTime, sentTime)) AS latestTime
        FROM emailsdata
        GROUP BY threadId
      ) latest ON e.threadId = latest.threadId AND IFNULL(e.receivedTime, e.sentTime) = latest.latestTime
      JOIN camptable c ON e.campId = c.camp_id
      JOIN threads t ON e.threadId = t.threads_id
      WHERE c.camp_type = ? AND t.isBookMarked = ? AND c.userId=?`;


  if (searchTerm) {
    baseQuery += ` AND (e.receiver_email LIKE ? OR e.subject LIKE ? OR e.emailBody LIKE ?)`;
    const searchPattern = `%${searchTerm}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  if (startDate && endDate) {
    baseQuery += ` AND ((e.receivedTime BETWEEN ? AND ?) OR (e.sentTime BETWEEN ? AND ?))`;
    queryParams.push(startDate, endDate, startDate, endDate);
  }

  // Query to count the total records
  let countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;

  // Query to retrieve the actual data
  let dataQuery = `
      SELECT e.email_id, e.receiver_email, e.subject, e.emailBody, IFNULL(e.receivedTime, e.sentTime) AS dateTime, e.domainName , e.threadId , t.isBookMarked
      ${baseQuery}`;

  if (sortingOptions === 'Newest First') {
    dataQuery += ` ORDER BY dateTime DESC`;
  } else if (sortingOptions === 'Oldest First') {
    dataQuery += ` ORDER BY dateTime ASC`;
  }

  if (rowsPerPage && currentPage) {
    const offset = (currentPage - 1) * rowsPerPage;
    dataQuery += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(rowsPerPage), parseInt(offset));
  }

  try {
    // Execute the count query
    const totalResult = await new Promise((resolve, reject) => {
      connection.query(countQuery, queryParams, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const totalCount = totalResult[0].total;

    // Execute the data query
    const dataResult = await new Promise((resolve, reject) => {
      connection.query(dataQuery, queryParams, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const data = dataResult.map(item => ({
      email_id: item.email_id,
      domainName: item.domainName,
      sender: item.receiver_email.split('@')[0].substring(0, 2).toUpperCase(),
      subject: item.subject,
      message: item.emailBody,
      threadId: item.threadId,
      isBookMarked: item.isBookMarked,
      date: formatDate(item.dateTime)
    }));

    return {
      success: true,
      totalCount,
      data
    };
  } catch (err) {
    console.error('Error in getBookMarkedEmailService', err);
    return {
      success: false,
      message: 'Error retrieving bookmarked emails'
    };
  } finally {
    connection.release();
  }
};

/////////////////////////////////Bookmark Controllers//////////////////////////////

const addToBookmark = async (req, res) => {
  let connection = await dbConnection.getConnection();
  const { threadId } = req.body;

  const query = `UPDATE threads SET isBookMarked = ? WHERE threads_id = ?`;

  await connection.query(query, [1, threadId], (error, results) => {
    if (error) {
      console.error('Error adding bookmark:', error);
      return res.status(500).json({ error: 'Failed to add bookmark.' });
    }

    return res.status(200).json({ message: 'Bookmark added successfully.' });
  });
};


const removeFromBookmark = async (req, res) => {
  let connection = await dbConnection.getConnection();
  const { threadId } = req.body;

  const query = `UPDATE threads SET isBookMarked = ? WHERE threads_id = ?`;

  await connection.query(query, [0, threadId], (error, results) => {
    if (error) {
      console.error('Error removing bookmark:', error);
      return res.status(500).json({ error: 'Failed to remove bookmark.' });
    }

    return res.status(200).json({ message: 'Bookmark removed successfully.' });
  });
};

module.exports = {
  addToBookmark,
  removeFromBookmark,
  getBookmarkedMails
};

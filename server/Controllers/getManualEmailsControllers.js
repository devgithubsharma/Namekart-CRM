const e = require('express');
const dbConnection = require('../dbConnection');
const { getBookmarkedMails } = require('./bookmarkControllers.js')

//////////////////////////////////Services////////////////////////////////////////////////

//For formatting date
const formatDate = (receivedTime) => {
  const date = new Date(receivedTime);
  const now = new Date();
  const istDate = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
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

const getSentCampaignEmailService = async (params) => {
  let connection = await dbConnection.getConnection();
  const userId = params.emailAccount;

  const { searchTerm, startDate, endDate, emailAccount, emailStatus, sentOption, sortingOptions, rowsPerPage, currentPage } = params;

  let baseQuery = `
    SELECT 
      e.campId,
      c.camp_name,
      MIN(e.sentTime) AS sentTime,
      COUNT(CASE WHEN e.trackingStatus = 'open' AND e.mailSequence = 'FirstMail' THEN 1 END) AS totalOpens,
      COUNT(CASE WHEN e.contactsClicked = 'yes' AND e.mailSequence = 'FirstMail' THEN 1 END) AS totalClicks,
      COUNT(CASE WHEN e.contactsUnsubscribed = 'yes' AND e.mailSequence = 'FirstMail' THEN 1 END) AS totalUnsubscribes,
      COUNT(CASE WHEN e.contactsReplied = 1 AND e.mailSequence = 'FirstMail' THEN 1 END) AS totalReplies,
      COUNT(CASE WHEN e.mailBounced = 'yes' AND e.mailSequence = 'FirstMail' THEN 1 END) AS totalBounced,
      COUNT(CASE WHEN e.firstMailCount = 1 AND e.mailSequence = 'FirstMail' THEN 1 END) AS totalFirstMails,
      COUNT(CASE WHEN e.followUpMailCount = 1 AND e.mailSequence = 'FollowUpMail' THEN 1 END) AS totalFollowUpMail,
      COUNT(CASE WHEN e.trackingStatus = 'open' AND e.mailSequence = 'FollowUpMail' THEN 1 END) AS totalFollowUpOpens,
      COUNT(CASE WHEN e.contactsReplied = 1 AND e.mailSequence = 'FollowUpMail' THEN 1 END) AS totalFollowUpReplies,
      COUNT(CASE WHEN e.mailBounced = 'yes' AND e.mailSequence = 'FollowUpMail' THEN 1 END) AS totalFollowUpMailBounced,
      COUNT(DISTINCT CASE WHEN e.mailSequence = 'FirstMail' THEN e.domainName END) AS totalDomains,
      COUNT(DISTINCT CASE WHEN e.mailSequence = 'FirstMail' THEN e.leads END) AS totalLeads,
      COUNT(DISTINCT CASE WHEN e.mailSequence = 'FirstMail' THEN e.receiver_email END) AS totalEmails
    FROM 
      emailsdata e
    JOIN 
      camptable c ON e.campId = c.camp_id
    WHERE 
      e.userId = ? AND e.sender_email = ?`;

  let queryParams = [userId, emailAccount];

  if (searchTerm) {
    baseQuery += ` AND (c.camp_name LIKE ?)`;
    const searchPattern = `%${searchTerm}%`;
    queryParams.push(searchPattern);
  }

  if (startDate && endDate) {
    baseQuery += ` AND e.sentTime BETWEEN ? AND ?`;
    queryParams.push(startDate, endDate);
  }

  baseQuery += ` GROUP BY e.campId, c.camp_name`

  // Finalize the query with sorting and pagination
  let dataQuery = baseQuery;

  if (sortingOptions === 'Newest First') {
    dataQuery += ` ORDER BY sentTime DESC`;
  } else if (sortingOptions === 'Oldest First') {
    dataQuery += ` ORDER BY sentTime ASC`;
  }

  if (rowsPerPage && currentPage) {
    const offset = (currentPage - 1) * rowsPerPage;
    dataQuery += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(rowsPerPage), parseInt(offset));
  }

  try {
    // Execute for count query
    const resultcount = await new Promise((resolve, reject) => {
      connection.query(baseQuery, queryParams, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // Execute the data query
    const result = await new Promise((resolve, reject) => {
      connection.query(dataQuery, queryParams, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // Format the result data
    const data = result.map(item => ({
      date: formatDate(item.sentTime),
      campaignName: item.camp_name,
      campId: item.campId,
      domains: item.totalDomains,
      leads: item.totalLeads,
      emails: item.totalEmails,
      opened: item.totalOpens,
      unsubscribed: item.totalUnsubscribes,
      bounced: item.totalBounced,
      clicked: item.totalClicks,
    }));

    return {
      success: true,
      totalCount: resultcount.length,
      data,
    };
  } catch (err) {
    console.error('Error in getSentEmailService', err);
    return {
      success: false,
      message: 'Error retrieving sent emails',
    };
  } finally {
    connection.release();
  }
};

const getSentRepliedEmailService = async (params) => {
  let connection = await dbConnection.getConnection();
  const emailType = "sent";
  const userId = params.emailAccount;
  const camp_type = "manual";
  const { searchTerm, startDate, endDate, emailAccount, emailStatus, sortingOptions, rowsPerPage, currentPage } = params;

  let baseQuery = `
    FROM emailsdata e
    JOIN camptable c ON e.campId = c.camp_id
    JOIN threads t ON e.threadId = t.threads_id
    WHERE c.camp_type = ? AND e.emailType = ? AND c.userId=? AND e.sender_email=? AND e.isRepliedMail = 1`;

  let queryParams = [camp_type, emailType, userId, emailAccount];

  if (searchTerm) {
    baseQuery += ` AND (e.receiver_email LIKE ? OR e.subject LIKE ? OR e.emailBody LIKE ?)`;
    const searchPattern = `%${searchTerm}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  if (startDate && endDate) {
    baseQuery += ` AND e.sentTime BETWEEN ? AND ?`;
    queryParams.push(startDate, endDate);
  }

  // Query to count the total records
  let countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;

  // Query to retrieve the actual data
  let dataQuery = `
    SELECT e.email_id, e.receiver_email, e.subject, e.emailBody, e.sentTime, e.domainName , e.threadId , t.isBookMarked
    ${baseQuery}`;

  if (sortingOptions === 'Newest First') {
    dataQuery += ` ORDER BY e.sentTime DESC`;
  } else if (sortingOptions === 'Oldest First') {
    dataQuery += ` ORDER BY e.sentTime ASC`;
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
      date: formatDate(item.sentTime)
    }));

    return {
      success: true,
      totalCount,
      data
    };
  } catch (err) {
    console.error('Error in getInboxEmailService', err);
    return {
      success: false,
      message: 'Error retrieving inbox emails'
    };
  } finally {
    connection.release();
  }
};

const getInboxEmailService = async (params) => {
  let connection = await dbConnection.getConnection();
  const emailType = "received";
  const userId = params.userId;
  const camp_type = "manual";
  const { searchTerm, startDate, endDate, emailStatus, emailAccount, sortingOptions, rowsPerPage, currentPage } = params;

  let baseQuery = `
    FROM emailsdata e
    JOIN (
      SELECT threadId, MAX(receivedTime) AS latestTime
      FROM emailsdata
      GROUP BY threadId
    ) latest ON e.threadId = latest.threadId AND e.receivedTime = latest.latestTime    
    JOIN camptable c ON e.campId = c.camp_id
    JOIN threads t ON e.threadId = t.threads_id
    WHERE c.camp_type = ? AND e.emailType = ? AND c.userId=? AND e.sender_email=?`;

  let queryParams = [camp_type, emailType, userId, emailAccount];

  if (searchTerm) {
    baseQuery += ` AND (e.receiver_email LIKE ? OR e.subject LIKE ? OR e.emailBody LIKE ?)`;
    const searchPattern = `%${searchTerm}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  if (startDate && endDate) {
    baseQuery += ` AND e.receivedTime BETWEEN ? AND ?`;
    queryParams.push(startDate, endDate);
  }

  // Query to count the total records
  let countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;

  // Query to retrieve the actual data
  let dataQuery = `
    SELECT e.email_id, e.receiver_email, e.subject, e.emailBody, e.receivedTime, e.domainName , e.threadId , t.isBookMarked
    ${baseQuery}`;

  if (sortingOptions === 'Newest First') {
    dataQuery += ` ORDER BY e.receivedTime DESC`;
  } else if (sortingOptions === 'Oldest First') {
    dataQuery += ` ORDER BY e.receivedTime ASC`;
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
      date: formatDate(item.receivedTime)
    }));

    return {
      success: true,
      totalCount,
      data
    };
  } catch (err) {
    console.error('Error in getInboxEmailService', err);
    return {
      success: false,
      message: 'Error retrieving inbox emails'
    };
  } finally {
    connection.release();
  }
};

const getDraftsEmailService = async (params) => {
  console.log("getDraftsEmailService", params);
};

const getScheduleEmailService = async (params) => {
  console.log("getScheduleEmailService", params);
};

const getBookmarkedEmailService = async (params) => {
  return getBookmarkedMails(params);
};

//for getting previous mail details for reply
const getCampaignEmailDataService = async (campId, userId, params) => {
  let connection = await dbConnection.getConnection();

  const emailType = params.emailType;
  const camp_type = "manual";
  let query = `
  SELECT e.email_id, e.receiver_email, e.subject, e.emailBody, e.receivedTime, e.domainName , e.threadId
  FROM emailsdata e
  JOIN camptable c ON e.campId = c.camp_id
  WHERE c.camp_type = ? AND e.emailType = ? AND c.userId=? AND e.campId =?`;
  let queryParams = [camp_type, emailType, userId, campId];

  try {
    const result = await new Promise((resolve, reject) => {
      connection.query(query, queryParams, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const data = result.map(item => ({
      status: 'success',
      email_id: item.email_id,
      domainName: item.domainName,
      sender: item.receiver_email,
      template: item.emailBody,
      threadId: item.threadId,
      date: formatDate(item.receivedTime)
    }));

    return data;
  } catch (err) {
    console.error('Error in getInboxEmailService', err);
    throw err;
  } finally {
    connection.release();
  }
}

/////////////////////////////////Controller//////////////////////////////////////////////

const getManualEmails = async (req, res) => {
  try {
    const activeTab = req.query.activeTab;
    let data;

    switch (activeTab) {
      case 'inbox':
        data = await getInboxEmailService(req.query);
        break;
      case 'sent':
        if (req.query.sentOption === "Campaign mail") {
          data = await getSentCampaignEmailService(req.query);
        } else {
          data = await getSentRepliedEmailService(req.query);
        }
        break;
      case 'drafts':
        data = await getDraftsEmailService(req.query);
        break;
      case 'schedule':
        data = await getScheduleEmailService(req.query);
        break;
      case 'bookmarked':
        data = await getBookmarkedEmailService(req.query);
        break;
      default:
        throw new Error('Invalid activeTab value');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getCampaignEmailData = async (req, res) => {
  try {
    const campId = req.params.campId;
    const userId = req.params.userId;
    const data = await getCampaignEmailDataService(campId, userId, req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getManualEmails,
  getCampaignEmailData
};
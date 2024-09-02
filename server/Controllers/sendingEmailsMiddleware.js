const dbConnection = require("../dbConnection");
const schedule = require('node-schedule');
const { sendEmailService } = require("./sendingEmailsController.js");

// Controller to start the campaign
const startCampaign = async (req, res) => {
  try {
    const campaignData = req.body;
    const storeResponse = await storeCampaignData(campaignData);

    if (storeResponse.success) {
      const startResponse = await startStoredUserCampaigns(campaignData.userId);
      if (startResponse.success) {
        res.status(200).send({
          message: "Campaign started and processed successfully",
          campaignData,
        });
      } else {
        res.status(500).send({ error: "Failed to start stored campaigns" });
      }
    } else {
      res.status(500).send({ error: "Failed to store campaign data" });
    }
  } catch (error) {
    console.error("Error in starting the campaign:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

//controller to get status of campaign
const fetchCampaignStatus = async (req, res) => {
  const { campId } = req.body;
  let connection;

  if (!campId) {
    return res.status(400).json({ error: "campId is required" });
  }

  try {
    connection = await dbConnection.getConnection();
    const query = "SELECT * FROM campaign_data WHERE campId = ?";

    connection.query(query, [campId], (error, results) => {
      if (error) {
        console.error("Error fetching campaign status:", error);
        return res
          .status(500)
          .json({ error: "Error fetching campaign status" });
      }

      if (results.length > 0) {
        res.json({ status: "running" });
      } else {
        res.json({ status: "not running" });
      }
    });
  } catch (error) {
    console.error("Error in fetchCampaignStatus:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/////////////////////////SERVICES//////////////////////////////////

// Service to start all pending campaigns of user in parallel
const startStoredUserCampaigns = async (userId) => {
  try {
    const allCampaigns = await getAllStoredCampaignData(userId);
    await Promise.all(allCampaigns.map(processSingleCampaign));
    return { success: true };
  } catch (error) {
    console.error("Error processing all campaigns:", error);
    return { success: false, error: "Error processing all campaigns" };
  }
};

// Service to start all pending campaigns in parallel
const startStoredCampaigns = async () => {
  try {
    const allCampaigns = await getAllStoredCampaignData();
    await Promise.all(allCampaigns.map(processSingleCampaign));
    return { success: true };
  } catch (error) {
    console.error("Error processing all campaigns:", error);
    return { success: false, error: "Error processing all campaigns" };
  }
};

// Service to process a single campaign
const processSingleCampaign = async (campaignData) => {
  let connection;
  try {
    connection = await dbConnection.getConnection();
    
    const stepIdsArray = campaignData.stepIds ? campaignData.stepIds.split(",") : [];
    const delayTimesArray = campaignData.delayTimes ? JSON.parse(campaignData.delayTimes) : [];
    const receiversEmails = campaignData.receiversEmails ? campaignData.receiversEmails.split(",") : [];
    const domains = campaignData.domains ? campaignData.domains.split(",") : [];
    const leads = campaignData.leads ? campaignData.leads.split(",") : [];
    const receiverName = campaignData.receiverName ? campaignData.receiverName.split(",") : [];
    const domainLinks = campaignData.domainLinks ? campaignData.domainLinks.split(",") : [];
    const stepSubjects = campaignData.stepSubjects ? campaignData.stepSubjects.split("|") : [];
    const stepPretexts = campaignData.stepPretexts ? campaignData.stepPretexts.split("|") : [];
    const stepBodies = campaignData.stepBodies ? campaignData.stepBodies.split("|") : [];
    const sendersEmails = campaignData.sendersEmails ? JSON.parse(campaignData.sendersEmails) : [];
    const senderNames = campaignData.senderNames ? JSON.parse(campaignData.senderNames) : [];
    const interval_from = campaignData.interval_from;
    const interval_to = campaignData.interval_to;

    for (let i = campaignData.currentStep; i < stepIdsArray.length; i++) {
      if ((delayTimesArray[i] <= Date.now()) || i == 0) {
        const data = {
          receiversEmails,
          domains,
          leads,
          receiverName,
          domainLinks,

          subject: stepSubjects[i] || '',
          pretext: stepPretexts[i] || '',
          body: stepBodies[i] || '',

          delay: delayTimesArray[i],
          sendersEmails,
          senderNames,
          campId: campaignData.campId,
          stepCount: i + 1,
          totalMailStep: stepIdsArray.length,
          userId: campaignData.userId,
          campRunningType: campaignData.campRunningType,
        };

        console.log("replicated request body of client",data);
        const emailServiceResponse = await sendEmailService(data);

        if (emailServiceResponse) {
          const updateQuery = `
            UPDATE campaign_data
            SET currentStep = ?
            WHERE id = ?
          `;
          await connection.query(updateQuery, [i + 1, campaignData.id]);
        } else {
          console.error(`Failed to send emails for step ${i + 1} of campaign ${campaignData.campId}`);
          break;
        }
      }
    }
    if (campaignData.currentStep >= stepIdsArray.length) {
      await deleteCampaignData(campaignData.id);
    }
  } catch (error) {
    throw new Error(`Error processing campaign with ID ${campaignData.campId}: ${error.message}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};


// const processSingleCampaign = async (campaignData) => {
//   let connection;
//   try {
//     connection = await dbConnection.getConnection();
    
//     const stepIdsArray = campaignData.stepIds ? campaignData.stepIds.split(",") : [];
//     const delayTimesArray = campaignData.delayTimes ? JSON.parse(campaignData.delayTimes) : [];
//     const receiversEmails = campaignData.receiversEmails ? campaignData.receiversEmails.split(",") : [];
//     const domains = campaignData.domains ? campaignData.domains.split(",") : [];
//     const leads = campaignData.leads ? campaignData.leads.split(",") : [];
//     const receiverName = campaignData.receiverName ? campaignData.receiverName.split(",") : [];
//     const domainLinks = campaignData.domainLinks ? campaignData.domainLinks.split(",") : [];
//     const stepSubjects = campaignData.stepSubjects ? campaignData.stepSubjects.split("|") : [];
//     const stepPretexts = campaignData.stepPretexts ? campaignData.stepPretexts.split("|") : [];
//     const stepBodies = campaignData.stepBodies ? campaignData.stepBodies.split("|") : [];
//     const sendersEmails = campaignData.sendersEmails ? JSON.parse(campaignData.sendersEmails) : [];
//     const senderNames = campaignData.senderNames ? JSON.parse(campaignData.senderNames) : [];
    
//     // Extract interval_from and interval_to from the campaign data
//     const intervalFrom = campaignData.interval_from;
//     const intervalTo = campaignData.interval_to;

//     for (let i = campaignData.currentStep; i < stepIdsArray.length; i++) {
//       const delayTime = new Date(delayTimesArray[i]);
//       const now = new Date();

//       if (delayTime < now) {
//         // Immediate email sending
//         const data = {
//           receiversEmails,
//           domains,
//           leads,
//           receiverName,
//           domainLinks,

//           subject: stepSubjects[i] || '',
//           pretext: stepPretexts[i] || '',
//           body: stepBodies[i] || '',

//           delay: delayTimesArray[i],
//           sendersEmails,
//           senderNames,
//           campId: campaignData.campId,
//           stepCount: i + 1,
//           totalMailStep: stepIdsArray.length,
//           userId: campaignData.userId,
//           campRunningType: campaignData.campRunningType,
//         };

//         const emailServiceResponse = await sendEmailService(data);

//         if (emailServiceResponse) {
//           const updateQuery = `
//             UPDATE campaign_data
//             SET currentStep = ?
//             WHERE id = ?
//           `;
//           await connection.query(updateQuery, [i + 1, campaignData.id]);
//         } else {
//           console.error(`Failed to send emails for step ${i + 1} of campaign ${campaignData.campId}`);
//           break;
//         }
//       } else if (
//         delayTime > now && 
//         delayTime.toDateString() === now.toDateString()
//       ) {
//         const [hourFrom, minuteFrom] = intervalFrom.split(':');
//         const [hourTo, minuteTo] = intervalTo.split(':');

//         const scheduleDateFrom = new Date();
//         scheduleDateFrom.setHours(hourFrom, minuteFrom, 0, 0);

//         const scheduleDateTo = new Date();
//         scheduleDateTo.setHours(hourTo, minuteTo, 0, 0);

//         const scheduleEmailJob = schedule.scheduleJob(scheduleDateFrom, async () => {
//           if (new Date() < scheduleDateTo) {
//             try {
//               const data = {
//                 receiversEmails,
//                 domains,
//                 leads,
//                 receiverName,
//                 domainLinks,

//                 subject: stepSubjects[i] || '',
//                 pretext: stepPretexts[i] || '',
//                 body: stepBodies[i] || '',

//                 delay: delayTimesArray[i],
//                 sendersEmails,
//                 senderNames,
//                 campId: campaignData.campId,
//                 stepCount: i + 1,
//                 totalMailStep: stepIdsArray.length,
//                 userId: campaignData.userId,
//                 campRunningType: campaignData.campRunningType,
//               };

//               const emailServiceResponse = await sendEmailService(data);

//               if (emailServiceResponse) {
//                 const updateQuery = `
//                   UPDATE campaign_data
//                   SET currentStep = ?
//                   WHERE id = ?
//                 `;
//                 await connection.query(updateQuery, [i + 1, campaignData.id]);
//               } else {
//                 console.error(`Failed to send scheduled emails for step ${i + 1} of campaign ${campaignData.campId}`);
//               }
//             } catch (error) {
//               console.error(`Error during scheduled email sending: ${error.message}`);
//             }
//           } else {
//             console.warn(`Scheduled time exceeded interval_to for step ${i + 1} of campaign ${campaignData.campId}`);
//           }
//         });
//         break; // Exit the loop as we're scheduling the job for later today
//       }
//     }

//     if (campaignData.currentStep >= stepIdsArray.length) {
//       await deleteCampaignData(campaignData.id);
//     }
//   } catch (error) {
//     throw new Error(`Error processing campaign with ID ${campaignData.campId}: ${error.message}`);
//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// };


// Service for storing campaign data
const storeCampaignData = async (campaignData) => {
  let connection;
  try {
    connection = await dbConnection.getConnection();

    // Insert campaign data into campaign_data table
    const insertCampaignQuery = `
      INSERT INTO campaign_data (
         sendersEmails, senderNames, campId, userId, currentStep, campRunningType, tags_id, sequenceId, delayTimes, firstmail_date, interval_from, interval_to 
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const sendersEmails = JSON.stringify(campaignData.sendersEmails || []);
    const senderNames = JSON.stringify(campaignData.senderNames || []);
    const delayTimes = JSON.stringify(campaignData.delayTimes || []);
    const campId = campaignData.campId || null;
    const userId = campaignData.userId || "";
    const currentStep = 0;
    const tags_id = campaignData.tags_id || null;
    const sequenceId = campaignData.sequenceId || null;
    const campRunningType = campaignData.campRunningType || "";
    const firstmail_date = campaignData?.firstmail_date || '2020-01-01';
    const interval_from = campaignData?.interval_from || '00:00';
    const interval_to = campaignData?.interval_to || '00:00';

    return new Promise((resolve, reject) => {
      connection.query(
        insertCampaignQuery,
        [
          sendersEmails,
          senderNames,
          campId,
          userId,
          currentStep,
          campRunningType,
          tags_id,
          sequenceId,
          delayTimes,
          firstmail_date,
          interval_from,
          interval_to
        ],
        (error, results) => {
          if (error) {
            console.error("Error inserting campaign data:", error.message);
            reject(new Error("Error inserting campaign data"));
          } else {
            const campaignId = results.insertId;

            // Insert scheduling data into scheduledCamp table
            const insertSchedulingData = () => {
              const schedulingData = campaignData.schedulingData || [];

              schedulingData.forEach((schedule) => {
                const day = schedule.day || "";
                const intervals = schedule.intervals || [];

                intervals.forEach((interval) => {
                  const fromTime = interval.from || null;
                  const toTime = interval.to || null;

                  const insertScheduledCampQuery = `
                    INSERT INTO scheduledCamp (campaign_data_id, day, from_time, to_time)
                    VALUES (?, ?, ?, ?)
                  `;

                  connection.query(
                    insertScheduledCampQuery,
                    [campaignId, day, fromTime, toTime],
                    (error) => {
                      if (error) {
                        console.error("Error inserting scheduling data:", error.message);
                        reject(new Error("Error inserting scheduling data"));
                      }
                    }
                  );
                });
              });
            };

            //insertSchedulingData();
            resolve({ success: true });
          }
        }
      );
    });
  } catch (error) {
    console.error("Error storing campaign data:", error.message);
    return { success: false, error: "Error storing campaign data" };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Service to get all stored campaign data
const getAllStoredCampaignData = async (userId) => {
  let connection;
  try {
    connection = await dbConnection.getConnection();
    const userCondition = userId ? 'WHERE campaign_data.userId = ?' : '';

    const query1 = `
      SELECT
          campaign_data.id,
          campaign_data.*,
          GROUP_CONCAT(listsdata.emails) AS receiversEmails,
          GROUP_CONCAT(listsdata.names) AS receiverName,
          GROUP_CONCAT(listsdata.domains) AS domains,
          GROUP_CONCAT(listsdata.links) AS domainLinks,
          GROUP_CONCAT(listsdata.leads) AS leads
      FROM
          campaign_data
      JOIN
          titles_tags ON campaign_data.tags_id = titles_tags.tags_id
      JOIN
          listsdata ON titles_tags.title_id = listsdata.title_id
      ${userCondition}
      GROUP BY
          campaign_data.id
    `;

    const query2 = `
      SELECT 
          campaign_data.id,
          GROUP_CONCAT(steps.step_id) AS stepIds,
          GROUP_CONCAT(steps.subject SEPARATOR '|') AS stepSubjects,
          GROUP_CONCAT(steps.pretext SEPARATOR '|') AS stepPretexts,
          GROUP_CONCAT(steps.body SEPARATOR '|') AS stepBodies,
          GROUP_CONCAT(steps.delay) AS stepDelays
      FROM 
          campaign_data
      JOIN 
          steps ON campaign_data.sequenceId = steps.sequenceId
      ${userCondition}
      GROUP BY 
          campaign_data.id
    `;

    // Running both queries asynchronously
    const [results1, results2] = await Promise.all([
      new Promise((resolve, reject) => {
        connection.query(query1, userId ? [userId] : [], (error, results) => {
          if (error) {
            reject(
              new Error(
                "Error fetching campaign and lists data: " + error.message
              )
            );
          } else {
            resolve(results);
          }
        });
      }),
      new Promise((resolve, reject) => {
        connection.query(query2, userId ? [userId] : [], (error, results) => {
          if (error) {
            reject(
              new Error("Error fetching campaign steps data: " + error.message)
            );
          } else {
            resolve(results);
          }
        });
      }),
    ]);

    // Combine and format results as needed
    const combinedResults = results1.map((result1) => {
      const correspondingResult2 = results2.find(
        (result2) => result2.id === result1.id
      );
      return {
        ...result1,
        ...correspondingResult2,
      };
    });

    return combinedResults;
  } catch (error) {
    throw new Error("Error fetching campaign data: " + error.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Service to delete campaign data by id
const deleteCampaignData = async (id) => {
  let connection;
  try {
    connection = await dbConnection.getConnection();
    const query = `
      DELETE FROM campaign_data
      WHERE id = ?
    `;
    await connection.query(query, [id]);
  } catch (error) {
    throw new Error("Error deleting campaign data");
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  startCampaign,
  getAllStoredCampaignData,
  startStoredCampaigns,
  deleteCampaignData,
  fetchCampaignStatus,
};

const dbConnection = require("../dbConnection");
const { sendEmailService } = require("./sendingEmailsController.js");

// Controller to start the campaign
const startCampaign = async (req, res) => {
  try {
    const campaignData = req.body;
    const storeResponse = await storeCampaignData(campaignData);

    if (storeResponse.success) {
      const startResponse = await startStoredCampaigns();
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


// Service for storing campaign data
const storeCampaignData = async (campaignData) => {
  let connection;
  try {
    connection = await dbConnection.getConnection();

    const insertQuery = `
      INSERT INTO campaign_data (
         sendersEmails, senderNames, campId, userId, currentStep, campRunningType, tags_id, sequenceId, delayTimes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    return new Promise((resolve, reject) => {
      connection.query(
        insertQuery,
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
        ],
        (error, results) => {
          if (error) {
            console.error("Error inserting campaign data:", error.message);
            reject(new Error("Error inserting campaign data"));
          } else {
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
const getAllStoredCampaignData = async () => {
  let connection;
  try {
    connection = await dbConnection.getConnection();

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
      GROUP BY 
          campaign_data.id
    `;

    // Running both queries asynchronously
    const [results1, results2] = await Promise.all([
      new Promise((resolve, reject) => {
        connection.query(query1, (error, results) => {
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
        connection.query(query2, (error, results) => {
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

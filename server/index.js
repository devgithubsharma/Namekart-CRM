const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
const dbConnection = require('./dbConnection');
const {google} = require('googleapis');
const cron = require('node-cron'); 
// const connection = dbConnection.getConnection();

const port = 90; //3001 / 90 / 9000

const { organizedEmailController } = require('./Controllers/receivingEmailsControllers.js');
const {createList} = require('./Controllers/listsController.js')
const {addTag} = require('./Controllers/addTagController.js')
const {uploadContacts} = require('./Controllers/uploadContactsController.js');
const { getEmails } = require('./Controllers/getEmailController.js');
const {signUp} = require('./Controllers/signUpController.js')
const {login} = require('./Controllers/loginController.js')
const {fetchTags} = require('./Controllers/fetchTagsController.js')
const {campaignsData} = require('./Controllers/campaignController.js')
const {getEmailsById} = require('./Controllers/getEmailsByListIdController.js')
const {getCampaignData} = require('./Controllers/getCampaignDataControllers.js')
const {deleteCampaign} = require('./Controllers/deleteCampaignController.js')
const {addEmails} = require('./Controllers/addEmailsController.js')
const {updateEmail} = require('./Controllers/updateEmailController.js')
const {deleteEmails} = require('./Controllers/deleteEmailsControllers.js')
const {getContactsLists} = require('./Controllers/getContactsListsControllers.js')
const {getSendersEmails} = require('./Controllers/getSendersEmailsControllers.js')
const {getListsTitle} = require('./Controllers/getListsTitleController.js');
const {isValidSenderEmails, sendEmails} = require('./Controllers/sendingEmailsController.js');
const {startCampaign,startStoredCampaigns,fetchCampaignStatus} = require('./Controllers/sendingEmailsMiddleware.js');
const {deleteTags} = require('./Controllers/deleteTagsControllers.js');
const {trackingEmails} = require('./Controllers/trackingEmailsController.js');
const {updateEmails} = require('./Controllers/UpdateEmailsController.js');
const {getSendersEmailsDetail} = require('./Controllers/getSenderEmailsDetailControllers.js');
const {saveSequenceDetails} = require('./Controllers/saveSequenceDetailsControllers.js')
const {getSequenceNames} = require('./Controllers/getSequenceNameControllers.js');
const {getSequenceDetails} = require('./Controllers/getSequenceDetailsControllers.js');
const {deleteSequence} = require('./Controllers/deleteSequenceControllers.js')
const {getDomainNames} = require('./Controllers/getDomainNamesControllers.js')
const {updateSequnceDetails} = require('./Controllers/UpdateSequenceDetailsControllers.js')
const {getSendersNames} = require('./Controllers/getSenderNamesControllers.js')
const {updateUnsubscribePage} = require('./Controllers/updateUnsubscribePageControllers.js')
const {campaignStats} = require('./Controllers/getCampaignStatsControllers.js')
const {updateDomainStatus} = require('./Controllers/updateDomainLinkStatusControllers.js')
const {processUpdateRepliesStatus} = require('./Controllers/repliesStatusControllers.js')
const {getSenderEmailsAndMessageIds} = require('./Controllers/getSenderEmailsAndMessageIdsControllers.js')
const {processEmailConversations} = require('./Controllers/emailsConversationsControllers.js')
const {liveDetectTrackingStatus} = require('./Controllers/updateLiveDetectDomainTrackingStatus.js')
const {liveDetectBounceStatus} = require('./Controllers/updateLiveDetectDomainBounceStatus.js')
const {liveDetectSentStatus} = require('./Controllers/updateLiveDetectDomainSentStatus.js')
const {sendLiveDetectEmails} = require('./Controllers/sendingLiveDetectEmailsControllers.js')
const {liveDetectRepliesStatus} = require('./Controllers/updateLiveDetectDomainRepliesStatus.js')
const {liveDetectLinkClick} = require('./Controllers/updateLiveDetectLinkClickControllers.js')
const {liveDetectSpam} = require('./Controllers/updateLiveDetectDomainSpamControllers.js')
const {liveDetectUnsubscribeLinkClick} = require('./Controllers/updateLiveDetectUnsubscribeLinkClickControllers.js')
const {liveDetectSubscriptionChange} = require('./Controllers/updateLiveDetectSubscriptionChangeControllers.js')
const {getFilteredCampaignData} = require('./Controllers/getFilteredCampaignData.js')
const {getIndexData} = require("./Controllers/getIndexDataControllers.js")
const {getCampIdUsingEmailKeyId} = require('./Controllers/getCampIdUsingEmailKeyIdControllers.js')
const {getChatData} = require('./Controllers/getChatDataControllers.js')
const {getInboxData} = require('./Controllers/getInboxDataControllers.js')
const {sendMessage} = require('./Controllers/sendOneToOneEmailsMessagesControllers.js')
const {getSenderNamesForQuickCampaign} = require('./Controllers/getSenderNamesForQuickCampaignControllers.js')
const {deleteStep} = require('./Controllers/deleteStepControllers.js')
const {getUpdatedSequence} = require('./Controllers/getUpdatedSequenceControllers.js')
const {tempApi} = require('./Controllers/tempApiCheckControllers.js')
const {uploadContactsFromDashboard} = require('./Controllers/directUploadAndRunCampaignControllers.js')
const {fetchContactsForTags} = require('./Controllers/fetchContactsForTagsControllers.js')
const {getSenderEmailsForCampId} = require('./Controllers/getSenderEmailsForCampIdControllers.js')
const {sendBulkEmails} = require('./Controllers/testingGmailApiControllers.js')
const {processEmailConversationsapi} = require('./Controllers/emailsConversationsControllers')
const {getManualEmails} = require('./Controllers/getManualEmailsControllers.js')
const {getCampaignEmailData} = require('./Controllers/getManualEmailsControllers.js')
const {addToBookmark, removeFromBookmark, getBookmarkedMails} = require('./Controllers/bookmarkControllers.js')
app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.post('/api/register',signUp);
app.post('/api/login',login);
app.post('/api/createTitle', createList);
app.get('/api/fetchTags/:userId',fetchTags);
app.post('/api/lists/addTag',addTag);
app.post('/api/campaignsData',campaignsData);
app.post('/api/listsData/uploadContacts',uploadContacts);
app.get('/api/listsData/getEmails',getEmails);
app.get('/api/receivingEmails', organizedEmailController);
app.get("/api/getEmailsByListId/:tags_id/:userId",getEmailsById);
app.get('/api/getCampaignsData/:userId',getCampaignData);
app.delete('/api/deleteCampaign',deleteCampaign);
app.post('/api/addEmails',addEmails);
app.put('/api/updateEmail/:sender_id',updateEmail);
app.delete('/api/deleteEmail/:emailToDelete',deleteEmails);
app.get('/api/getContactList/:userId',getContactsLists);
app.get('/api/getSenderEmails/:userId',getSendersEmails);
app.get('/api/getListTitle/:userId',getListsTitle);
// app.post('/api/startCampaign',sendEmails);
app.post('/api/startCampaign',startCampaign);
app.post('/api/campaignStatus',fetchCampaignStatus);
app.post('/api/isValidSenderEmails',isValidSenderEmails);
app.delete('/api/deleteTag/:tagToDelete',deleteTags);
app.get('/mailTrack', trackingEmails);
app.put('/api/updateEmailToken',updateEmails);
app.get('/api/getSenderEmailsDetails/:userId',getSendersEmailsDetail)
app.get('/api/campaignemaildata/:campId/:userId',getCampaignEmailData)
app.post('/api/saveSequenceDetails',saveSequenceDetails)
app.get('/api/seqName/:campId',getSequenceNames)
app.get('/api/seqDetails',getSequenceDetails)
app.delete('/api/deleteSequence/:id',deleteSequence)
app.get('/api/getDomainNames/:tags_id/:userId',getDomainNames)
app.put('/api/updateSequenceDetails',updateSequnceDetails)
app.get('/api/getSenderNames/:userId',getSendersNames)
app.put('/api/updateUnsubscribeStatus/:campId/:mailId',updateUnsubscribePage)
app.get('/api/campaignStats/:selectedCampaign/:userId',campaignStats)
app.get('/api/updateDomainLinkStatus/:campId/:mailId',updateDomainStatus)
app.get('/api/getSenderEmailsAndMessageIds',getSenderEmailsAndMessageIds)
app.post('/api/sendLiveDetectEmails',sendLiveDetectEmails)
app.post('/postmark/inbound',liveDetectRepliesStatus)
app.get('/api/getFilteredCampaignData/:selectedCampaignType/:userId',getFilteredCampaignData)
app.get('/api/indexData/:userId',getIndexData)
app.get('/api/chatsCampId/:email_id',getCampIdUsingEmailKeyId)
app.get('/api/chatEmailData/:threadId/:userId',getChatData)
app.get('/api/inboxItems/:userId',getInboxData)
app.post('/api/sendReply',sendMessage)
app.get('/api/getSenderNamesForQuickCampaign/:userId',getSenderNamesForQuickCampaign)
app.delete('/api/deleteStep/:stepId/:sequenceId',deleteStep)
app.get('/api/fetchUpdatedSequences/:sequenceId',getUpdatedSequence)
app.get('/api/tempApi',tempApi)
app.post('/api/uploadContactsFromDashboard',uploadContactsFromDashboard)
app.get('/api/fetchContactsForTags/:tags_id',fetchContactsForTags)
app.get('/api/getSenderEmailsForCampId/:campId',getSenderEmailsForCampId)
app.post('/api/sendBulkEmails',sendBulkEmails)
app.post('/api/testingRelies',processEmailConversationsapi)
// app.get('/message-streams/broadcast/suppressions/dump',liveDetectSubscriptionChange)
app.get('/api/manualemails',getManualEmails);
app.put('/api/bookmark/add',addToBookmark);
app.put('/api/bookmark/remove',removeFromBookmark);
app.get('/api/bookmark/get',getBookmarkedMails);


app.post('/postmark/webhook', (req,res) =>{
  console.log('events',req.body)
  const event = req.body;
         if(event.RecordType==='Open') {
            liveDetectTrackingStatus(event);
            
         }else if(event.RecordType==='Bounce'){
          liveDetectBounceStatus(event);
          
         }else if(event.RecordType==='Delivery'){
          liveDetectSentStatus(event);
          
         }else if(event.RecordType==='Click'){
          console.log('click')

          if (event.Url.includes('unsubscribe')){
            liveDetectUnsubscribeLinkClick(event)

          }else{
            liveDetectLinkClick(event)
          }

         }else if(event.RecordType==='SpamComplaint'){
          liveDetectSpam(event)
          
         }else if(event.RecordType==='SubscriptionChange'){
          liveDetectSubscriptionChange(event)
          
         }

         else{
          console.log('Unhandled event type:', event.RecordType);
         }
                
    res.status(200).send('Webhook processed');
})


app.delete('/api/deleteEmail/:emailId', async (req, res) => {
  const { emailId } = req.params;
  const connection = await dbConnection.getConnection();
  const query = 'DELETE FROM sendertable WHERE sender_id = ?';

  await connection.query(query, [emailId], (err, result) => {
      if (err) {
          console.error('Error deleting email:', err);
          return res.status(500).send({ message: 'Error deleting email' });
      }
      res.send({ message: 'Email deleted successfully' });
  });
});



app.get('/api/getEmailInfo',async (req,res)=>{
  console.log("getEmailInfo")
  let connection;
  try{
    connection = await dbConnection.getConnection();
    console.log("connection",connection)
    await processEmailConversations(connection);
    res.send({"Success":"Successfully fetched"})

  }catch(err){
    console.log("Error in fetching mails",err)
    res.send({"Error":err})
  }
})

// // Schedule to run every 10 minutes
// cron.schedule('*/10 * * * *', async () => {
//   console.log('Running updateRepliesStatus and save replies to db every 10 minutes');
//   const connection = await dbConnection.getConnection();
//   try {
//       await processEmailConversations(connection);
//     console.log("Process completed successfully.");
//   } catch (error) {
//     console.error("Error during the cron job process:", error);
//   } finally {
//     connection.release();
//   }
// });

cron.schedule('0 0 * * *', async () => {
  try {
    await startStoredCampaigns();
    console.log("startStoredCampaigns executed successfully at 23:00");
  } catch (error) {
    console.error("Error executing startStoredCampaigns:", error);
  }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    // startStoredCampaigns();
  });

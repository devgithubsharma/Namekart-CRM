const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
const dbConnection = require('./dbConnection');
const {google} = require('googleapis');
const cron = require('node-cron'); 

const port = 3001;

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
const {deleteEmails} = require('./Controllers/deleteEmailsControllers.js')
const {getContactsLists} = require('./Controllers/getContactsListsControllers.js')
const {getSendersEmails} = require('./Controllers/getSendersEmailsControllers.js')
const {getListsTitle} = require('./Controllers/getListsTitleController.js');
const {sendEmails} = require('./Controllers/sendingEmailsController.js');
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

app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.post('/api/register',signUp);
app.post('/api/login',login);
app.post('/api/createTitle', createList);
app.get('/api/fetchTags',fetchTags);
app.post('/api/lists/addTag',addTag);
app.post('/api/campaignsData',campaignsData);
app.post('/api/listsData/uploadContacts',uploadContacts);
app.get('/api/listsData/getEmails',getEmails);
app.get('/api/receivingEmails', organizedEmailController);
app.get("/api/getEmailsByListId/:titleId",getEmailsById);
app.get('/api/getCampaignsData',getCampaignData);
app.delete('/api/deleteCampaign',deleteCampaign);
app.post('/api/addEmails',addEmails);
app.delete('/api/deleteEmail/:emailToDelete',deleteEmails);
app.get('/api/getContactList',getContactsLists);
app.get('/api/getSenderEmails',getSendersEmails);
app.get('/api/getListTitle',getListsTitle);
app.post('/api/startCampaign',sendEmails);
app.delete('/api/deleteTag/:tagToDelete',deleteTags);
app.get('/mailTrack', trackingEmails);
app.put('/api/updateEmailToken',updateEmails);
app.get('/api/getSenderEmailsDetails',getSendersEmailsDetail)
app.post('/api/saveSequenceDetails',saveSequenceDetails)
app.get('/api/seqName/:campId',getSequenceNames)
app.get('/api/seqDetails',getSequenceDetails)
app.delete('/api/deleteSequence/:id',deleteSequence)
app.get('/api/getDomainNames/:titleId',getDomainNames)
app.put('/api/updateSequenceDetails',updateSequnceDetails)
app.get('/api/getSenderNames',getSendersNames)
app.put('/api/updateUnsubscribeStatus/:campId/:mailId',updateUnsubscribePage)
app.get('/api/campaignStats/:selectedCampaign',campaignStats)
app.get('/api/updateDomainLinkStatus/:campId/:mailId',updateDomainStatus)
app.get('/api/getSenderEmailsAndMessageIds',getSenderEmailsAndMessageIds)
app.post('/api/sendLiveDetectEmails',sendLiveDetectEmails)
app.post('/postmark/inbound',liveDetectRepliesStatus)
app.get('/api/getFilteredCampaignData/:selectedCampaignType',getFilteredCampaignData)
app.get('/api/indexData',getIndexData)
app.get('/api/chatsCampId/:email_id',getCampIdUsingEmailKeyId)
app.get('/api/chatEmailData/:threadId',getChatData)
app.get('/api/inboxItems',getInboxData)

// app.get('/message-streams/broadcast/suppressions/dump',liveDetectSubscriptionChange)


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


// cron.schedule('*/1 * * * *', async () => {
//   console.log('Running updateRepliesStatus every 15 seconds');
//   const connection = await dbConnection.getConnection();
//   try {
//       await processUpdateRepliesStatus(connection);
//       console.log("Process completed successfully.");
//   } catch (error) {
//       console.error("Error during the cron job process:", error);
//   } finally {
//       connection.release();
//   }
// });

// cron.schedule('*/1 * * * *', async () => {
//   console.log('Running updateRepliesStatus every 15 seconds');
//   const connection = await dbConnection.getConnection();
//   try {
//       await processEmailConversations(connection);
//       console.log("Process completed successfully.");
//   } catch (error) {
//       console.error("Error during the cron job process:", error);
//   } finally {
//       connection.release();
//   }
// });


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
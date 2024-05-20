// controllers/receivingEmailsController.js
const receivingEmails = require("../receivingEmails")
// console.log(receivingEmails)
async function organizedEmailController(req, res) {
  console.log('X')
    try {
    const emailsData = await receivingEmails.execute();
    console.log(emailsData);

    // execute().then((emailsData)=>{
    //   console.log(emailsData)
    // }).catch(err =>{
    //   console.log(err)
    // })


    } catch (error) {
      console.error('Error fetching receiving emails:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  module.exports = {
    organizedEmailController,
  };

  
  



import './App.css';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import Home from './components/Home';
import ReceivingEmail from './components/ReceivingEmails';
import MailingCampaigns from './components/Campaigns/MailingCampaigns';
import Campaigns from './components/Campaigns/Campaigns';
import UploadContacts from './components/Contact/ContactPages/AddContactPages/UploadContacts';
import CreateContacts from './components/Contact/ContactPages/AddContactPages/CreateContacts';
import AddContacts from './components/Contact/ContactPages/AddContacts';
import Contacts from './components/Contact/Contacts';
import AddEmails from './components/Campaigns/AddEmails';
import SendersEmails from './components/Campaigns/SendersEmails';
import CampaignStatus from './components/Campaigns/CampaignStatus';
import UnSubscribePage from './components/UnSubscribePage';
import DomainLinkPage from './components/DomainLinkPage';
import EmailChatting from './components/EmailChatting';
import ChatBox from './components/ChatBox';
import Signup from './components/Authentication/SignUp';
import Login from './components/Authentication/Login';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import OAuth2Callback from './components/OAuth2Callback';

import TermsAndServices from './pages/policies/TermsAndServices';
import PrivacyPolicy from './pages/policies/PrivacyPolicy';

import ManualMail from './pages/messages/ManualMail';
import BulkMail from './pages/messages/BulkMail';
import LiveDetectMail from './pages/messages/LiveDetectMail';
import CampMailDetails from './components/messages/CampMailDetails';

function App() {
  return (
    // basename={'/crm'}
  <Router basename={'/crm'}>
    <Routes>
    <Route path="/" element={<Signup/>}/>
    <Route path="/login" element={<Login/>}/>
      <Route path='/home' element={<Home/>}>
        <Route path="/home/contacts" exact element={<AuthenticatedRoute> < Contacts/> </AuthenticatedRoute>} />
        <Route path='/home/createContacts' exact element={<AuthenticatedRoute> <CreateContacts/> </AuthenticatedRoute>} />
        <Route path='/home/uploadContacts' element={<UploadContacts />} />
        <Route path='/home/manualCampaigns' exact element={<AuthenticatedRoute> <Campaigns/> </AuthenticatedRoute>}/>
        <Route path='/home/chattingMessages' exact element={<AuthenticatedRoute><EmailChatting/></AuthenticatedRoute>}/>
        <Route path='/home/campaignStatus' exact element={<AuthenticatedRoute><CampaignStatus/></AuthenticatedRoute>}/>
        <Route path='/home/mailingCampaigns' exact element={<AuthenticatedRoute> <MailingCampaigns/> </AuthenticatedRoute>}/>
        <Route path="/home/receivingEmails" element={<ReceivingEmail/>} />
        <Route path='/home/userEmails' exact element={<AuthenticatedRoute><SendersEmails/></AuthenticatedRoute>}/>
        <Route path="/home/chats/:threadId" element={<ChatBox/>} />

        {/* <Route path="/home/messages/manualmail/camp/:campId" element={<CampMailDetails/>} /> */}
        <Route path='/home/messages/manualmail' exact element={<AuthenticatedRoute><ManualMail/></AuthenticatedRoute>}/>
        <Route path='/home/messages/bulkmail' exact element={<AuthenticatedRoute><BulkMail/></AuthenticatedRoute>}/>
        <Route path='/home/messages/livedetectmail' exact element={<AuthenticatedRoute><LiveDetectMail/></AuthenticatedRoute>}/>
      </Route>
      <Route path="/termsAndServices" element={<TermsAndServices/>} />
      <Route path="/privacyPolicy" element={<PrivacyPolicy/>} />
      <Route path="/oauth2callback" element={<OAuth2Callback/>} />
      <Route path='/unsubscribe/:campId/:mailId' element={<UnSubscribePage/>}></Route>
      <Route path='/domainLink/:campId/:mailId/:domainLink' element={<DomainLinkPage/>}></Route>
    </Routes>
  </Router> 
  
  );
}

export default App;

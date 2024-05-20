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

function App() {
  return (
  <Router>
    <Routes>
      <Route path='/' element={<Home/>}>
        <Route path="/contacts" element={< Contacts/>} />
        <Route path='/createContacts' element={<CreateContacts/>} />
        <Route path='/uploadContacts' element={<UploadContacts />} />
        <Route path='/manualCampaigns' element={<Campaigns/>}/>
        <Route path='/chattingMessages' element={<EmailChatting/>}/>
        <Route path='/campaignStatus' element={<CampaignStatus/>}/>
        <Route path='/mailingCampaigns' element={<MailingCampaigns/>}/>
        <Route path="/receivingEmails" element={<ReceivingEmail />} />
        <Route path='/userEmails' element={<SendersEmails/>}/>
        <Route path="/chats/:threadId" element={<ChatBox />} />
      </Route>
      <Route path='/unsubscribe/:campId/:mailId' element={<UnSubscribePage/>}></Route>
      <Route path='/domainLink/:campId/:mailId/:domainLink' element={<DomainLinkPage/>}></Route>
    </Routes>
  </Router> 
  );
}

export default App;

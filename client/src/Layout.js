// Layout.js
import React, { useContext, useState } from 'react';
import ReceivingEmail from './components/ReceivingEmails';
import {Routes, Route } from "react-router-dom";
import AddContacts from './components/Contact/ContactPages/AddContacts';
import Contacts from './components/Contact/Contacts';
import CreateContacts from './components/Contact/ContactPages/AddContactPages/CreateContacts';  
import UploadContacts from './components/Contact/ContactPages/AddContactPages/UploadContacts';
import Campaigns from './components/Campaigns/Campaigns';
import MailingCampaigns from './components/Campaigns/MailingCampaigns';
import Home from './components/Home';

const Layout = () => {
  return (
      <div style={{ display: 'flex' , flexDirection: 'column'}}>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path="/receivingEmails" element={<ReceivingEmail />} />
                <Route path="/contacts" element={< Contacts/>}>
                  <Route path='addContacts' element={<AddContacts/>} /> 
                  <Route path='addContacts/createContacts' element={<CreateContacts/>} />
                </Route> 
                <Route path='/uploadContacts' element={<UploadContacts />} />
                <Route path='/campaigns' element={<Campaigns/>}/>
                <Route path='/mailingCampaigns' element={<MailingCampaigns/>}></Route>
            </Routes>
      
    </div>
  );
};

export default Layout;
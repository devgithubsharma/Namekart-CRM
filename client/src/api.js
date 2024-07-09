// import { appBarClasses } from '@mui/material';
import axios from 'axios';
const API_BASE_URL_LOCALHOST = 'http://localhost:3001/api';
const API_BASE_URL_NAMEKART = "https://crmapi.namekart.com/api";

const api = axios.create({
    baseURL: API_BASE_URL_NAMEKART,
    responseType: "json",
    headers: { 
     accept: "application/json",
     "Content-Type": "application/json",
   },          
   timeout: 1000 * 60,
});


export const fetchTag = async (params) => {
    try {
        const response = await api.get(`/fetchTags/${params}`);
        return response;
    } catch (error) {
        console.log("Error in fetchTag",error)
        throw error.response.data;
    }
};

export const fetchCampaign = async (params) => {
    try {
        const response = await api.get(`/getCampaignsData/${params}`);
        return response;
    } catch (error) {
        console.log("Error in fetchCampaign",error)
        throw error.response.data;
    }
};

export const deleteCampaigns = async (campId) => {
    try {
        await api.delete(`/deleteCampaign`,{
            data: { campId: campId } 
          });
    } catch (error) {
        console.log("Error in deleteCampaigns",error)
        throw error.response.data;
    }
};


export const saveCampaign = async (campaignName,tags, titleId,userId) => {
    try {
        const response = await api.post('/campaignsData', { campaignName, tagName: tags,
        titleId : titleId , userId:userId});
        return response;  
    } catch (error) {
        console.log("Error in saveCampaign",error)
        throw error.response.data;
    }
};

export const fetchFilteredCampaigns = async (params1,params2) => {
    try {
        const response = await api.get(`/getFilteredCampaignData/${params1}/${params2}`);
        return response;   
    } catch (error) {
        console.log("Error in fetchFilteredCampaigns",error)
        throw error.response.data;
    }
};

export const fetchListData = async (params1,params2) => {
    try {
        const response = await api.get(`/getEmailsByListId/${params1}/${params2}`);
        return response;  
    } catch (error) {
        console.log("Error in fetchFilteredCampaigns",error)
        throw error.response.data;
    }
};


export const fetchCampaignsStats = async (params1,params2) => {
    try {
        const response = await api.get(`/campaignStats/${params1}/${params2}`);
        return response;   
    } catch (error) {
        console.log("Error in fetchCampaignsStats",error)
        throw error.response.data;
    }
};

export const saveSequences = async (data) => {
    try {
        const response = await api.post('/saveSequenceDetails', data);
        return response;   
    } catch (error) {
        console.log("Error in saveSequences",error)
        throw error.response.data;
    }
};

export const updateSequences = async (id,name,steps) => {
    try {
        const response = await api.put('/updateSequenceDetails', {
      sequenceId: id,
      sequenceName: name,
      steps: steps,
    });
        return response; 
    } catch (error) {
        console.log("Error in updateSequences",error)
        throw error.response.data;
    }
};

export const deleteSequence = async (params) => {
    try {
        await api.delete(`/deleteSequence/${params}`);  
    } catch (error) {
        console.log("Error in deleteSequence",error)
        throw error.response.data;
    }
};

export const fetchSenderEmails = async (params) => {
    try {
        const response = await api.get(`/getSenderEmails/${params}`)
        return response;
    } catch (error) {
        console.log("Error in fetchSenderEmails",error)
        throw error.response.data;
    }
};

export const fetchSequenceDetails = async () => {
    try {
        const response = await api.get(`/seqDetails`);
        return response;
    } catch (error) {
        console.log("Error in fetchSequenceDetails",error)
        throw error.response.data;
    }
};

export const deleteStep = async (params1,params2) => {
    try {
        const response = await api.delete(`/deleteStep/${params1}/${params2}`);
        return response;
    } catch (error) {
        console.log("Error in deleteStep",error)
        throw error.response.data;
    }
};

export const fetchUpdatedSequence = async (params) => {
    try {
        const response = await api.get(`/fetchUpdatedSequences/${params}`);
        return response;
    } catch (error) {
        console.log("Error in fetchUpdatedSequence",error)
        throw error.response.data;
    }
};

export const fetchSenderNames = async (params1,params2) => {
    try {
        const response = await api.get(`/getSenderNames/${params1}?ids=${params2}`);
        return response;
    } catch (error) {
        console.log("Error in fetchSenderNames",error)
        throw error.response.data;
    }
};

export const isValidSenderEmails = async (data) => {
    try {
        const response = await api.post(`/isValidSenderEmails`, data);
        return response;
    } catch (error) {
        console.log("Error in fetchSenderNames",error)
        throw error.response.data;
    }
};

export const fetchDomainNames = async (params1,params2) => {
    try {
        const response = await api.get(`/getDomainNames/${params1}/${params2}`);
        return response;
    } catch (error) {
        console.log("Error in fetchDomainNames",error)
        throw error.response.data;
    }
};

export const startCampaigns = async (data) => {
    try {
        const response = await api.post('/startCampaign', data);
        return response;
    } catch (error) {
        console.log("Error in startCampaign",error)
        throw error.response.data;
    }
};

export const fetchSenderNamesForQuickCamp = async (params) => {
    try {
        const response = await axios.get(`/getSenderNamesForQuickCampaign/${params}`)
        return response;
    } catch (error) {
        console.log("Error in fetchSenderNamesForQuickCamp",error)
        throw error.response.data;
    }
};

export const saveTitle = async (title,userId) => {
    try {
        const response = await api.post('/createTitle', { title: title,userId:userId });
        return response;
    } catch (error) {
        console.log("Error in saveTitle",error)
        throw error.response.data;
    }
};

export const uploadContacts = async (titleId,userId,csvData,tag) => {
    try {
        const response = await api.post('/listsData/uploadContacts',{
        titleId: titleId,
        userId: userId,
        csvColumns: csvData[0],     
        csvValues: csvData,   
        tag:tag
      });
        return response;
    } catch (error) {
        console.log("Error in uploadContacts",error)
        throw error.response.data;
    }
};

export const deleteTag = async (params) => {
    try {
        const response = await api.delete(`/deleteTag/${params}`)
        return response;
    } catch (error) {
        console.log("Error in deleteTag",error)
        throw error.response.data;
    }
};

export const saveTags = async (titleId,tagInput,userId) => {
    try {
        const response = await api.post('/lists/addTag', {
                titleId: titleId,
                tag: tagInput,
                userId:userId
            });  
        return response;
    } catch (error) {
        console.log("Error in saveTags",error)
        throw error.response.data;
    }
};

export const saveSenderEmails = async (email,name,accessTokenInput,refreshTokenInput,userId) => {
    try {
        const response = await api.post('/addEmails', {
          email: email, 
          name: name,
          accessToken: accessTokenInput, 
          refreshToken: refreshTokenInput, 
          userId:userId
        });
        return response;
    } catch (error) {
        console.log("Error in saveSenderEmails",error)
        throw error.response.data;
    }
};

export const updateSenderEmail = async (editRowId, editedEmail, editedName, editedRefreshToken, userId) => {
    try {
        const response = api.put(`/updateEmail/${editRowId}`,{
            email: editedEmail, 
            name: editedName,
            accessToken: "", 
            refreshToken: editedRefreshToken, 
            userId:userId
        })
        return response;
    } catch (error) {
        console.log("Error in update sender Email",error)
        throw error.response.data;
    }
};

export const deleteEmail = async (params) => {
    try {
        const response = api.delete(`/deleteEmail/${params}`)
        return response;
    } catch (error) {
        console.log("Error in deleteEmail",error)
        throw error.response.data;
    }
};

export const fetchSenderEmailsDetails = async (params) => {
    try {
        const response= await api.get(`/getSenderEmailsDetails/${params}`);
        return response;
    } catch (error) {
        console.log("Error in fetchSenderEmailsDetails",error)
        throw error.response.data;
    }
};

export const fetchListsTitle = async (params) => {
    try {
        const response = await api.get(`/getListTitle/${params}`);
        return response;
    } catch (error) {
        console.log("Error in fetchListTitle",error)
        throw error.response.data;
    }
};

export const fetchContactList = async (params) => {
    try {
        const response = await api.get(`/getContactList/${params}`);
        return response;
    } catch (error) {
        console.log("Error in fetchContactList",error)
        throw error.response.data;
    }
};

export const fetchChats = async (params1,params2) => {
    try {
        const response = await api.get(`/chatEmailData/${params1}/${params2}`);
        return response;
    } catch (error) {
        console.log("Error in fetchChats",error)
        throw error.response.data;
    }
};

export const fetchInboxItems = async (params) => {
    try {
        const response = await api.get(`/inboxItems/${params}`);
        return response;
    } catch (error) {
        console.log("Error in fetchChats",error)
        throw error.response.data;
    }
};

export const sendReply = async (sender_email,receiver_email,subject,replyText,campId,threadId,domainName,leads,messageId,userId) => {
    try {
        const response = await api.post(`/sendReply`, {
                sender_email: sender_email,
                receiver_email: receiver_email,
                subject:subject,
                emailBody: replyText,
                campId: campId,
                threadId:  threadId,
                domainName: domainName,
                lead: leads,
                messageId: messageId,
                userId:userId
            });
        return response;
    } catch (error) {
        console.log("Error in sendReply",error)
        throw error.response.data;
    }
};


export const fetchCampId = async (params) => {
    try {
        const response = await api.get(`/chatsCampId/${params}`); 
        return response;
    } catch (error) {
        console.log("Error in fetchCampId",error)
        throw error.response.data;
    }
};


export const fetchIndexData = async (params,type) => {
    try {
        const response = await api.get(`/indexData/${params}`, {
                    params :{
                        type: type
                    }                 
                }); 
        return response;
    } catch (error) {
        console.log("Error in fetchIndexData",error)
        throw error.response.data;
    }
};


export const logins = async (login,password) => {
    try {
        const response = await api.post('/login', { 
          login:login, 
          password:password,
        }, {
            timeout: 120000, 
          });
        console.log("response",response)
        return response;
    } catch (error) {
        console.log("Error in login",error)
        throw error.response.data;
    }
};

export const signUp = async (username,email,password) => {
    try {
        const response = await api.post('/register', { 
        username, 
        email, 
        password 
      });
        return response;
    } catch (error) {
        console.log("Error in signUp",error)
        throw error.response.data;
    }
};

export const fetchContactForTag = async (params) => {
    try {
        const response = await api.get(`/fetchContactsForTags/${params}`); 
        return response;
    } catch (error) {
        console.log("Error in fetchContactForTag",error)
        throw error.response.data;
    }
};


import React, { useState, useEffect ,useContext} from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Modal from 'react-modal';
import { Tabs, Tab } from '@mui/material';
import '../../style/CampaignStatus.css';
import { makeStyles } from '@material-ui/core/styles';
import { GlobalContext } from '../ContextApi/GlobalContext';
import {fetchFilteredCampaigns} from '../../api'
import {fetchListData} from '../../api'
import {fetchCampaignsStats} from '../../api'


const useStyles = makeStyles({
  tab: {
    // color: 'black',
    // marginRight: '20px',
    // '&.Mui-selected': {
    //   backgroundColor: 'black',
    //   color: 'white',
    //   borderRadius:'20px',

    // },
    '&:hover': {
      backgroundColor: 'transparent', // Set hover background to transparent or the desired color
    },
  },
  tabList: {
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& .MuiTabs-flexContainer': {
      justifyContent: 'center',
    },
    '& .MuiTabs-indicator': {
      display: 'none',
    },
  }
});

function CampaignStatus() {
  const [campaignDetails, setCampaignDetails] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedTitleId,setSelectedTitleId] = useState(null);
  const [selectedTagId,setSelectedTagId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [csvLength,setCsvLength] = useState([]);
  const [mailSentCount,setMailSentCount] = useState(null);
  const [mailsOpened,setMailsOpened] = useState(null);
  const [mailBounced,setMailBounced] = useState(null);
  const [contactsClicked,setContactsClicked] = useState(null);
  const [contactsUnsubscribed,setContactsUnsubscribed] = useState(null);
  const [senderEmails, setSenderEmails] = useState([]);
  const [contactsReplied,setContactsReplied] = useState(null);
  const [senderEmailsAndMessageIds,setSenderEmailsAndMessageIds] = useState([]);
  // const [totalFirstMailCount,setTotalFirstMailCount] = useState(null);
  // const [totalFollowUpMailCount,setTotalFollowUpMailCount] = useState(null);
  const [followUpSent, setFollowUpSent] = useState(null);
  const [followUpOpened,setFollowUpOpened] = useState(null);
  const [followUpReplies, setFollowUpReplies] = useState(null);
  const [followUpBounced, setFollowUpBounced] = useState(null);
  const [totalFirstMailSentCount,setTotalFirstMailSentCount] = useState(null);
  const [totalFollowUpMailSentCount,setTotalFollowUpMailSentCount] = useState(null);
  const [tabValue, setTabValue] = useState(0); // State to manage active tab
  const [selectedCampaignType, setSelectedCampaignType] = useState('liveDetect');
  const { userId } = useContext(GlobalContext);


const classes = useStyles();
  const firstEmailStatement = (mailSentCount + mailBounced) >= csvLength.length 
    ? "All first emails of this sequence have been sent."
    : "Sending first emails...";


  const followUpStatement = (mailSentCount + mailBounced) >= csvLength.length 
    ? (totalFollowUpMailSentCount >= csvLength.length
        ? "All follow-up emails have been sent to all contacts."
        : "Sending follow-up emails...")
    : "";


  useEffect(() => {
    const fetchCampaigns = async () => {
      const campaignTypes = ['liveDetect', 'bulk', 'manual'];
      setSelectedCampaignType(campaignTypes[tabValue]); 
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/getFilteredCampaignData/${selectedCampaignType}/${userId}`);
        const response = await fetchFilteredCampaigns(selectedCampaignType,userId)
        console.log(response.data.result)
        setCampaignDetails(response.data.result);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };
    fetchCampaigns();
  }, [tabValue,selectedCampaignType]);


  useEffect(() => {
    const fetchListsData = async () => {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/getEmailsByListId/${selectedTitleId}/${userId}`);
        // const response = await fetchListData(selectedTitleId,userId)
        const response = await fetchListData(selectedTagId,userId)
        console.log(response)
        setCsvLength(response.data.domains);
      } catch (err) {
        console.error('Error in fetching List data', err);
      }
    };
    fetchListsData();
  }, [selectedTagId,selectedTitleId,tabValue,selectedCampaignType]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  

  const filteredCampaigns = campaignDetails.filter(campaign => {
    console.log(`Filtering: ${campaign.camp_type}`); // Log the camp_type of each campaign
    if (tabValue === 0) {
        console.log('Checking for liveDetect:', campaign.camp_type === 'liveDetect');
        return campaign.camp_type === 'liveDetect';
    }

    if (tabValue === 1) {
        console.log('Checking for bulk:', campaign.camp_type === 'bulk');
        return campaign.camp_type === 'bulk';
    }

    if (tabValue === 2) {
        console.log('Checking for manual:', campaign.camp_type === 'manual');
        return campaign.camp_type === 'manual';
    }
    
    return false;
});


  useEffect(()=>{
    console.log('selectedCampaignType',filteredCampaigns)
  },[filteredCampaigns]);


  const rows = filteredCampaigns.map((campaign, index) => ({
    id: index,
    camp_name: campaign.camp_name,
  }));

  const columns = [
    { field: 'camp_name', headerName: 'Campaign', width: 800 },
  ];


  useEffect(() => {
    if (selectedCampaign !== null) {
      const fetchStats = () => {
         // axios.get(`https://crmapi.namekart.com/api/campaignStats/${selectedCampaign}/${userId}`)
         fetchCampaignsStats(selectedCampaign,userId)
          .then(response => {
            console.log(response)
            setMailSentCount(response.data.totalFirstMails);
            setContactsUnsubscribed(response.data.totalUnsubscribes);
            setMailsOpened(response.data.totalMailsOpened);
            setMailBounced(response.data.totalBounced);
            setContactsClicked(response.data.totalClicks);
            setContactsReplied(response.data.totalReplies);
            setFollowUpSent(response.data.totalFollowUpMail);
            setFollowUpOpened(response.data.totalFollowUpOpens);
            setFollowUpReplies(response.data.totalFollowUpReplies);
            setFollowUpBounced(response.data.totalFollowUpMailBounced);
          })
          .catch(error => console.error('Error fetching campaign stats:', error));
      };

      fetchStats();
    }
  }, [selectedCampaign,isModalOpen]);

useEffect(()=>{
  console.log('mailsOpened',mailsOpened)
},[selectedCampaign,isModalOpen])
 
  const handleRowClick = async (params) => {
    const clickedCampaign = campaignDetails.find(campaign => campaign.camp_name === params.row.camp_name);
    setSelectedCampaign(clickedCampaign.camp_id)
    setSelectedTitleId(clickedCampaign.title_id)
    setSelectedTagId(clickedCampaign.tags_id)
    setIsModalOpen(true);
  };

  useEffect(()=>{
    console.log('senderEmailsAndMessageIds =>', senderEmailsAndMessageIds)
  },[selectedCampaign,isModalOpen])



useEffect(()=>{
  console.log('mailSent Count',mailSentCount)
})

  return (
    <div style={{ height: 400, width: '80%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '25px' }}>Campaign Statistics</h2>

      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="LiveDetect Campaigns" className={classes.tab}/>
        <Tab label="Bulk Campaigns" className={classes.tab}/>
        <Tab label="Manual Campaigns" className={classes.tab}/>
      </Tabs>

      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        onRowClick={handleRowClick}
        sx={{
            cursor: 'pointer',
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: '700',
            marginLeft: '16px', 
          },
          '& .MuiDataGrid-cell': {
            marginLeft: '16px', 
          },
          '& .MuiDataGrid-columnHeaders': {
            fontSize: '1.1rem',
          },
          }}
      />


      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Campaign Status"
        className="Modal"
        overlayClassName="Overlay"
      >
        

        <div className="ModalContent">
            <div className='CardRow1'>
                <div className="Card">
                    <div className="CardTitle">Contacts Outreached</div>
                    <div className="CardStats">
                        <div className="CardValue">{mailSentCount}</div> 
                        {tabValue === 2 && (
                            <div className="CardPercentage">{csvLength.length > 0 ? ((mailSentCount / csvLength.length) * 100).toFixed(2) : "0.00"}%</div> 
                        )}
                    </div>
                </div>

                <div className="Card">
                    <div className="CardTitle">Contacts replied</div>
                    <div className="CardStats">
                        <div className="CardValue">{contactsReplied}</div> 
                        <div className="CardPercentage">{mailSentCount > 0 ? ((contactsReplied / mailSentCount) * 100).toFixed(2) : "0.00"}%</div> 
                    </div>
                </div>

                <div className="Card">
                    <div className="CardTitle">Contacts unsubscribed</div>
                    <div className="CardStats">
                        <div className="CardValue">{contactsUnsubscribed}</div> 
                        <div className="CardPercentage">{mailSentCount > 0 ? ((contactsUnsubscribed / mailSentCount) * 100).toFixed(2) : "0.00"}%</div> 
                    </div>
                </div>
            </div>

            <div className='CardRow2'>
                <div className="Card">
                    <div className="CardTitle">Contacts bounced</div>
                    <div className="CardStats">
                        <div className="CardValue">{mailBounced}</div> 
                        {tabValue === 2 && (
                            <div className="CardPercentage">{csvLength.length > 0 ? ((mailBounced / csvLength.length) * 100).toFixed(2) : "0.00"}%</div> 
                        )}
                    </div>
                </div>


                <div className="Card">
                    <div className="CardTitle">Contacts clicked</div>
                    <div className="CardStats">
                        <div className="CardValue">{contactsClicked}</div> 
                        <div className="CardPercentage">{mailSentCount > 0 ? ((contactsClicked / mailSentCount) * 100).toFixed(2) : "0.00"}%</div> 
                    </div>
                </div>

                <div className="Card">
                <div className="CardTitle">Contacts opened</div>
                  <div className="CardStats">
                      <div className="CardValue">{mailsOpened}</div>
                      <div className="CardPercentage">
                      {mailSentCount > 0 ? ((mailsOpened) / mailSentCount * 100).toFixed(2) : "0.00"}%
                      </div>
                  </div>
                </div>

            </div>
            <div style={{ width: '100%' }}>
                    <p className="EmailStatement">{firstEmailStatement}</p> 
              </div>


{
  (mailSentCount + mailBounced) >= csvLength.length && (
    <>
      <div className='CardRow3'>
        <div className="Card">
          <div className="CardTitle">FollowUps Outreached</div>
          <div className="CardStats">
            <div className="CardValue">{followUpSent}</div>
            <div className="CardPercentage">{csvLength.length > 0 ? ((followUpSent / csvLength.length) * 100).toFixed(2) : "0.00"}%</div>
          </div>
        </div>

        <div className="Card">
          <div className="CardTitle">FollowUps Replies</div>
          <div className="CardStats">
            <div className="CardValue">{followUpReplies}</div>
            <div className="CardPercentage">{followUpSent > 0 ? ((followUpReplies / followUpSent) * 100).toFixed(2) : "0.00"}%</div>
          </div>
        </div>

        <div className="Card">
          <div className="CardTitle">FollowUps Opened</div>
          <div className="CardStats">
            <div className="CardValue">{followUpOpened}</div>
            <div className="CardPercentage">{followUpSent > 0 ? ((followUpOpened / followUpSent) * 100).toFixed(2) : "0.00"}%</div>
          </div>
        </div>
      </div>

      <div className='CardRow4'>
        <div className="Card">
          <div className="CardTitle">FollowUps Bounced</div>
          <div className="CardStats">
            <div className="CardValue">{followUpBounced}</div>
            <div className="CardPercentage">{csvLength.length > 0 ? ((followUpBounced / csvLength.length) * 100).toFixed(2) : "0.00"}%</div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%' }}> 
            <p className="EmailStatement">{followUpStatement}</p> 
      </div>
    </>
  )
}

        </div>
      </Modal>
  </div>
  );
}

export default CampaignStatus;
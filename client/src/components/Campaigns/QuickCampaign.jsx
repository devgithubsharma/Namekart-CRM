import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Modal, Box, Typography, TextField, Chip, MenuItem, FormControl ,Select, Button, InputLabel,TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import axios from 'axios';
import Papa from 'papaparse';
import { updateCampaignStatus } from '../IndexedDB/CampaignStatusIdb';
import { GlobalContext } from '../ContextApi/GlobalContext';
import {fetchSenderEmails} from '../../api'
import {fetchSenderNamesForQuickCamp} from '../../api'
import {fetchSequenceDetails} from '../../api'
import {saveTitle} from '../../api'
import {uploadContacts} from '../../api'
import {startCampaigns} from '../../api'
import {deleteTag} from '../../api'
import {saveTags} from '../../api'
import {fetchTag} from '../../api'
import {saveCampaign} from '../../api'
import {fetchListData} from '../../api'
// import { fetchCampaignStatus } from '../IndexedDB/CampaignStatusIdb';


const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 750,
    height:220,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };



function QuickCampaignModal({isOpen, onClose}){
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState('');
  const [tags, setTags] = useState([]);
  const [fetchedTags, setFetchedTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [receiverEmails, setReceiverEmails] = useState([]);
  const [senderEmails, setSenderEmails] = useState([]);
  const [senderNames, setSenderNames] = useState([])
  const [tagInput, setTagInput] = useState('');
  const [listTitle, setListTitle] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [titleId, setTitleId] = useState(null);
  const [domainNames, setDomainNames] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [selectedSequence, setSelectedSequence] = useState('');
  const [receiverName, setReceiverName] = useState([]);
  const [leads,setLeads] = useState([]);
  const [temporaryTag, setTemporaryTag] = useState('');
//   const [isCampaignRunning, setIsCampaignRunning] = useState(false);
  const [isFirstEmail, setIsFirstEmail] = useState(true);
  const [campId, setCampId] = useState(null);
  const [domainLink,setDomainLink] = useState([]);
  const navigate = useNavigate();
  const { userId } = useContext(GlobalContext);

  console.log("userId",userId)

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCampaignName('');
      setListTitle('');
      setSelectedFileName('');
      setCsvData(null)
      setTags([]);
      setTagInput('');
      setSelectedTag('');
      setReceiverEmails([]);
    }
  }, [isOpen]);



  useEffect(() =>{
    const fetchSendersEmails = async () =>{
      try{
        // const response = await axios.get(`https://crmapi.namekart.com/api/getSenderEmails/${userId}`)
        const response = await fetchSenderEmails(userId)
        console.log(response)
        setSenderEmails(response.data.result)
      }catch(err){
        console.error('Error in fetching senders emails:', err);
      }
    }
    fetchSendersEmails();
  },[isOpen])

  
  useEffect(() =>{
    const fetchSenderNames = async () =>{
      try{
        // const response = await axios.get(`https://crmapi.namekart.com/api/getSenderNamesForQuickCampaign/${userId}`)
        const response = await fetchSenderNamesForQuickCamp(userId)
        console.log(response)
        setSenderNames(response.data.result)
      }catch(err){
        console.error('Error in fetching senders names:', err);
      }
    }
    fetchSenderNames();
  },[isOpen])



  useEffect(()=>{
    console.log('selectedFile',csvData)
  },[csvData])


  useEffect(() => {
    const fetchSequencesDetails = async () => {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/seqDetails`);
        const response = await fetchSequenceDetails()
        console.log(response)
        const fetchedData = response.data.result; 
  
        const sequencesMap = fetchedData.reduce((acc, currentItem) => {
          
          const {
            sequence_id,
            sequence_name,
            step_id,
            subject,
            pretext,
            body,
            delay
          } = currentItem;
  
          if (!acc[sequence_id]) {
            acc[sequence_id] = {
              id: sequence_id.toString(),
              name: sequence_name,
              isNew: false,
              steps: []
            };
          }
  
          acc[sequence_id].steps.push({
            step_id,
            subject,
            pretext,
            body,
            delay
          });
  
          return acc;
        }, {});
  
        // Convert the map back to an array
        const sequences = Object.values(sequencesMap);
  
        if (sequences.length > 0) {
          setSequences(sequences.map(sequence => ({ ...sequence, isNew: false })));
          // setSelectedSequence(sequences[0].id);
          
        } else {
          // Handle the case where no sequences are returned
          setSequences(['No Saved Sequences']);
          // setSelectedSequence('');
        }
      } catch (error) {
        console.error('Error fetching sequence details:', error);
      }}
    fetchSequencesDetails();
  }, [isOpen]); 


  const handleSequenceChange = (event) => {
    const sequence = sequences.find(seq => seq.id === event.target.value);
    setSelectedSequence(sequence);
  };


  useEffect(()=>{
    console.log('selectedSequence',selectedSequence)
  },[selectedSequence])


  const handleContinue1 = async () => {
    try{
      console.log('Creating a new list with title:', listTitle);
      // const response = await axios.post('https://crmapi.namekart.com/api/createTitle', { title: listTitle,userId:userId });
      const response = await saveTitle(listTitle,userId)
      console.log(response)
      setTitleId(response.data.title.title_id)
    }catch(err){  
      console.log('Handle Continue error', err)
    }       
  };   


  const handleNext = () => {
    if(step===2){
        handleContinue1().then(()=>{
            setStep((currentStep) => currentStep + 1);
        }).catch((error) => {
            console.error('Error during API call:', error);
          });


    }else if(step===3){
        handleUploadContacts().then(()=>{
            setStep((currentStep) => currentStep + 1);
        }).catch((err) =>{
            console.error('Error during API call:', err);
        })


    }else if(step===4){
        handleCampaignData().then(()=>{
            setStep((currentStep) => currentStep + 1);
        }).catch((err)=>{
            console.error('Error during API call:', err);
        })

    } else if(step===5){
        startCampaign();
    }

    else{
        setStep((currentStep) => currentStep + 1);
    }
  };

  const handleBack = () => {
    setStep((currentStep) => Math.max(1, currentStep - 1));
  };

  const handleUploadContacts = async () => {
    try {  
      // const uploadResponse = await axios.post('https://crmapi.namekart.com/api/listsData/uploadContacts',{
      //   titleId: titleId,
      //   userId: userId,
      //   csvColumns: csvData.data[0],     
      //   csvValues: csvData.data,   
      // });
      const uploadResponse = await uploadContacts(titleId,userId,csvData.data,temporaryTag)
      console.log('Upload Contacts response', uploadResponse);
      
    } catch (err) {
      console.log('Upload Contacts error', err.message);
    }

  };

  useEffect(()=>{
    console.log('CampId',campId)
  },[campId])

  const startCampaign = async () => {
    try{

      let cumulativeDelay = 0;
      updateCampaignStatus(campId, "running");

      for (let i = 0; i < selectedSequence.steps.length; i++) {
        const step = selectedSequence.steps[i];

        console.log(step)
        const campaignData = {
          receiversEmails: receiverEmails, 
          sendersEmails: senderEmails,
          senderNames: senderNames,
          receiverName:receiverName,
          leads:leads,
          subject: step.subject,
          pretext: step.pretext,
          emailBody: step.body,
          delay: cumulativeDelay, 
          domains:domainNames,
          campId: campId,
          stepCount:i+1,
          domainLinks: domainLink,
          userId:userId,
          campRunningType:"quickCampaign"
        };

        onClose(); 
        navigate('/home/manualCampaigns', { replace: true });
        // const response = await axios.post('https://crmapi.namekart.com/api/startCampaign', campaignData);
        const response = await startCampaigns(campaignData)
        setIsFirstEmail(false)
        console.log("Response:", response);  
        cumulativeDelay = step.delay;
      }
      
      updateCampaignStatus(campId, "completed");

    }catch(err){
      updateCampaignStatus(campId, "interrupted");
        console.error('Error in starting campaign:', err);
    }
  };


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setSelectedFileName(selectedFile.name)
        Papa.parse(selectedFile, {
          complete: (result) => {
            console.log(result)
            if (Array.isArray(result.data) && result.data.length > 0) {
              const parsedCsvData = result.data.filter(row =>
                Object.values(row).some(cell => cell !== undefined && cell.trim() !== '')
              );
              console.log(parsedCsvData)
              setCsvData({ data: parsedCsvData });

            } else {
              console.error("Invalid CSV format. Data is not an array or is empty.");
            }
          },
          header: true, 
        });
      }
      e.target.value = null;
  }


const handleTagInputChange = (event) => {
    setTagInput(event.target.value);
    setTemporaryTag(event.target.value)
  };



  const handleDeleteTag = (tagIdToDelete) => {
    setTags((prevTags) => prevTags.filter((tagObj) => tagObj.id !== tagIdToDelete));
    // axios.delete(`https://crmapi.namekart.com/api/deleteTag/${tagIdToDelete}`)
    deleteTag(tagIdToDelete)
    .then(response => {
        console.log('Email deleted:', response.data);
    })                
    .catch(error => {
        console.error('Failed to delete email:', error);
    });
  };


  const handleAddTag = async () => {
    try{
        if (tagInput && !tags.includes(tagInput) && tags.length < 3) {
            // const response = await axios.post('https://crmapi.namekart.com/api/lists/addTag', {
            //     titleId: titleId,
            //     tag: tagInput,
            //     userId:userId
            // }); 
            
            const response = await saveTags(titleId,tagInput,userId);
            console.log("response - ",response);
            if(response.data.message!=="Tag already exist"){
              console.log('Tag Id', response.data);
              const newTags = { id: response.data.tagIds, tag: tagInput };
              setTags([...tags,newTags]);
              setTagInput('');  
            }else{
              const newTags = { tag: tagInput };
              setTags([...tags,newTags]);
              setTagInput(''); 
            }


          }
    }catch(err){
        console.error('Error adding tag:', err.message); 
    }
  };


  useEffect(() => {     
    const fetchTags = async () => {
      console.log('Fetch tags called')   
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/fetchTags/${userId}`); 
        const response = await fetchTag(userId)
        setFetchedTags(response.data.result);   
      } catch (error) {  
        console.error('Error fetching tags:', error); 
      }   
    }; 
    fetchTags();  
  }, [isOpen,tags]);


  useEffect(()=>{
    console.log('leads',leads)
  },[leads])


  const handleCampaignData = async () => {
    try{
        // const response = await axios.post('https://crmapi.namekart.com/api/campaignsData',{ campaignName, tagName: selectedTag.tags,
        // titleId : selectedTag.title_id, userId:userId})
        const response = await saveCampaign(campaignName,selectedTag.tags,selectedTag.title_id,userId)
        console.log(response.data.camp_id)
        setCampId(response.data.camp_id)
    }catch(err){
        console.log('Error in handleCampaignData', err)
    }
  }


  const handleSelectTag = async () =>{
    console.log(selectedTag)
    if (selectedTag && selectedTag.title_id) {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/getEmailsByListId/${selectedTag.title_id}/${userId}`);
        const response = await fetchListData(selectedTag.title_id,userId)
        console.log(response)
        setReceiverEmails(response.data.emails); 
        setDomainNames(response.data.domains)
        setReceiverName(response.data.names)
        setLeads(response.data.leads)
        setDomainLink(response.data.links)
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    }
  } 


  useEffect(()=>{
    console.log('Domain links', domainLink)
  },[domainLink])


  const handleTagInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

//  
  const handleTagChange = (e) => {
    const selectedValue = e.target.value;
    const selectedTagObject = fetchedTags.find(tag => tag.tags === selectedValue) || {};
    setSelectedTag(selectedTagObject);
  };


  useEffect(()=>{
    console.log('sequences',sequences)
  },[sequences])


  return(
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >

      <Box sx={modalStyle}>
        {step === 1 && (
          <>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Enter Campaign Name
            </Typography>
            <TextField
              fullWidth
              label="Campaign Name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              margin="normal"
            />
            <Box display="flex" justifyContent="flex-end">
                <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
                Next
                </Button>
            </Box>
          </>
        )}

        {step === 2 && (
          <>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Enter List Title
            </Typography>
            <TextField
              fullWidth
              label="List Title"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              margin="normal"
            />
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button variant="outlined" onClick={handleBack}>
                Back
              </Button>
              <Button variant="contained" onClick={handleNext}>
                Continue
              </Button>
            </Box>
          </>
        )}

        {step===3 && (
            <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', mr: 2 }}>
                    <Typography  id="modal-modal-title" variant="h6" component="h2" marginBottom={2}>
                        Upload CSV File
                    </Typography>

                    <Button variant="contained" component="label" sx={{ mt: 2, width:130 }}>
                        Upload File
                        <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                    {selectedFileName && ( 
                    <Typography sx={{ mt: 2 }}>File: {selectedFileName}</Typography>
                    )}

                </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column',marginLeft:'120px', flex: 1 }}>
            <Typography variant="h6">Add Tags for CSV</Typography>

            <TextField
                label="Tag"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                variant="outlined"
                size="small"
                sx={{ my: 2, width:250 }}
                disabled={tags.length >= 3}
            />

            <Button 
                onClick={handleAddTag} 
                variant="contained" 
                size="small" 
                sx={{width:80, display: 'flex', justifyContent:'flex-end'}}
                disabled={tags.length >= 3 || tagInput.trim() === ''}
            >
                Add Tag
            </Button>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>

                {tags.map((tagObj, index) => (
                <Chip key={index} label={tagObj.tag} onDelete={() => handleDeleteTag(tagObj.id)} />
                ))}

            </Box>

            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" mt={2}>
              <Button variant="outlined" onClick={handleBack}>
                Back
              </Button>
              <Button variant="contained" onClick={handleNext}>
                Continue
              </Button>
        </Box>
        </>
        )}


        {step===4 && (
            <>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ minWidth: 160, marginRight: 2  }}>
            <FormControl fullWidth>
              <InputLabel id="tag-select-label">Select Tag</InputLabel>

              <Select
                labelId="tag-select-label"
                value={selectedTag ? selectedTag.tags : ''}
                onChange={handleTagChange}
                label="Select Tag" 
              >

                {fetchedTags.map((tagsObj, index) => ( 
                  <MenuItem key={index} value={tagsObj.tags}>{tagsObj.tags}</MenuItem>
                ))}
              </Select>

            <Button variant="contained" onClick={handleSelectTag} sx={{ mt:3, width:150 }}>
              Select Tag
            </Button>
            </FormControl>
        </Box>


            <Box sx={{ display: 'flex', gap: 2, overflow: 'auto' }}>
                <TableContainer component={Paper} sx={{ maxHeight: 150, width: 300,flex: 1, overflow: 'auto'  }}>
                  <Table stickyHeader aria-label="receiver-emails-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Receiver Emails</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {receiverEmails.map((email, index) => (
                        <TableRow key={index}>
                          <TableCell>{email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TableContainer component={Paper} sx={{ maxHeight: 150, width: 300,flex: 1, overflow: 'auto' }}>
                  <Table stickyHeader aria-label="sender-emails-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sender Emails</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {senderEmails.map((emailObj, index) => (
                        <TableRow key={index}>
                          <TableCell>{emailObj.sender_email_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" mt={5}>
              <Button variant="outlined" onClick={handleBack}>
                Back
              </Button>
              <Button variant="contained" onClick={handleNext}>
                Continue
              </Button>
        </Box>
        </>
        )}

{step === 5 && (
  <>
    <Typography variant="h6">Select a Sequence</Typography>
    <Select
      fullWidth
      value={selectedSequence ? selectedSequence.id : ''}
      onChange={handleSequenceChange}
      displayEmpty
      inputProps={{ 'aria-label': 'Select a Sequence' }}
    >
      <MenuItem value="">
        <em>None</em>
      </MenuItem>
      {sequences.map((seq) => (
        <MenuItem key={seq.id} value={seq.id}>{seq.name}</MenuItem>
      ))}
    </Select>
    <Box display="flex" justifyContent="flex-end" mt={2}>
      <Button variant="contained" onClick={startCampaign}>
        Start Campaign
      </Button>
    </Box>
  </>
)} 
      </Box>
    </Modal>

  )
}

export default QuickCampaignModal;
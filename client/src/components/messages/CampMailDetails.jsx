import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../ContextApi/GlobalContext';
import {
  Table, TableBody, TableCell,Dialog, Button, TableContainer, TableHead, TableRow, Paper, Avatar, Box, Typography, Card, CardContent, Grid, IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CircleIcon from '@mui/icons-material/Circle';
import MailIcon from '@mui/icons-material/Mail';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe';
import BlockIcon from '@mui/icons-material/Block';
import ClickIcon from '@mui/icons-material/CheckCircleOutline';
import { fetchCampaignEmailData } from '../../api';
import { fetchCampaignsStats } from '../../api';
import MailChatBox from "../../components/messages/MailChatBox";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const columns = [
  { id: 'status', label: 'STATUS', minWidth: 50 },
  { id: 'domainName', label: 'DOMAIN NAME', minWidth: 150 },
  { id: 'sender', label: 'SENDER', minWidth: 100 },
  { id: 'template', label: 'TEMPLATE', minWidth: 200 },
  { id: 'quickAction', label: 'QUICK ACTION', minWidth: 100 },
  { id: 'date', label: 'DATE', minWidth: 100 },
];

const CampMailDetails = ({ campData, handleBackClick }) => {
  const { userId } = useContext(GlobalContext);
  const [data, setData] = useState([]);
  const [statsData, setStatsData] = useState({});
  const [emailType, setEmailType] = useState("received");
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);

  const filterParams = (params) => {
    return Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value != null && value !== "")
    );
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const getCampaignData = async () => {
    try {
      setData([]);
      let params = { emailType };
      const filteredParams = filterParams(params);
      const response = await fetchCampaignEmailData(campData.campId, filteredParams, userId);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
    }
  };

  const getCampaignStatsData = async () => {
    try {
      setStatsData({});
      const response = await fetchCampaignsStats(campData.campId, userId);
      console.log(response.data);
      setStatsData(response.data);
    } catch (error) {
      console.error("Error fetching campaign stats data:", error);
    }
  };

  useEffect(() => {
    if (campData.campId) {
      getCampaignData();
    }
  }, [campData.campId, emailType]);

  useEffect(() => {
    getCampaignStatsData();
  }, [campData.campId]);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleBackClick} edge="start" color="inherit" aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom paddingRight={1}>
            {campData.campaignName}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Completed
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={() => setEmailType(emailType === "sent" ? "received" : "sent")}
          sx={{ 
            bgcolor: '#111', color: 'white','&:hover': { bgcolor: '#222'}
          }}
        >
          {emailType === "sent" ? "See Received" : "See Sent"}
        </Button>
      </Box>
      <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{statsData?.totalFirstMails?.[0] ?? 'N/A'}</Typography>
                <Typography variant="body2" color="textSecondary">Emails Sent</Typography>
              </Box>
              <MailIcon color="primary" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{statsData?.totalMailsOpened?.[0] ?? 'N/A'}</Typography>
                <Typography variant="body2" color="textSecondary">Opened</Typography>
              </Box>
              <VisibilityIcon color="primary" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{statsData?.totalUnsubscribes?.[0] ?? 'N/A'}</Typography>
                <Typography variant="body2" color="textSecondary">Unsubscribe</Typography>
              </Box>
              <UnsubscribeIcon color="primary" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{statsData?.totalBounced?.[0] ?? 'N/A'}</Typography>
                <Typography variant="body2" color="textSecondary">Bounced</Typography>
              </Box>
              <BlockIcon color="primary" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{statsData?.totalClicks?.[0] ?? 'N/A'}</Typography>
                <Typography variant="body2" color="textSecondary">Clicked</Typography>
              </Box>
              <ClickIcon color="primary" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <TableContainer component={Paper} sx={{ border: '1px solid #f0f0f0' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    minWidth: column.minWidth,
                    height: 40,
                    border: '1px solid #f0f0f0',
                    fontWeight: 'bold',
                    padding: '8px',
                    backgroundColor: '#f8f8f8',
                    fontFamily: 'inherit',
                    fontSize: '12px',
                  }}
                >
                  {
                    column.id === 'sender' ? (
                      emailType === 'received' ? 'SENDER' : 'RECEIVER'
                    ) : (
                      column.label
                    )
                  }
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={index} onClick={() => handleRowClick(row)}>
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCell
                      key={column.id}
                      sx={{
                        minWidth: column.minWidth,
                        height: 40,
                        padding: '8px',
                        border: '1px solid #f0f0f0',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                      }}
                    >
                      {column.id === 'status' ? (
                        value === 'error' ? <ErrorIcon color="error" /> : <CheckCircleIcon color="primary" />
                      ) : column.id === 'sender' ? (
                        <Box display="flex">
                          <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
                            {value.slice(0, 2).toUpperCase()}
                          </Avatar>{value}</Box>
                      ) : column.id === 'quickAction' ? (
                        <Box display="flex">
                          <CircleIcon sx={{ color: 'red', fontSize: '12px', marginRight: '4px' }} />
                          <CircleIcon sx={{ color: 'green', fontSize: '12px', marginRight: '4px' }} />
                          <CircleIcon sx={{ color: 'blue', fontSize: '12px' }} />
                        </Box>
                      ) : (
                        value
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
          <MailChatBox props={selectedRow}/>
      </Dialog>
    </Box>
  );
};

export default CampMailDetails;


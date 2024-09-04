import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../../components/ContextApi/GlobalContext';
import {
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Avatar,
  Select,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import { format } from "date-fns";
import { ArrowDropDown, Search, DateRange } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchManualEmails } from "../../api";
import { fetchSenderEmailsDetails } from "../../api";
import { useLocation, useNavigate } from "react-router";

import Pagination from "../../components/messages/Pagination";
import SentMail from "../../components/messages/SentMail";
import InboxMail from "../../components/messages/InboxMail";
import RepliedSentMail from "../../components/messages/RepliedSentMail";
import BookMarkedMail from "../../components/messages/BookMarkedMail";

const sortingOption = ["Newest First", "Oldest First"];
const sentOptions = ["Campaign mail", "Replied mail"];


const ManualMail = () => {
  const { userId } = useContext(GlobalContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorE2, setAnchorE2] = useState(null);
  const [senderEmails, setSenderEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpenCamp, setIsOpenCamp] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [data, setData] = useState([]);

  const [activeTab, setActiveTab] = useState("inbox");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [isValidDate, setIsValidDate] = useState(false);
  const [endDate, setEndDate] = useState(null);
  const [emailAccount, setEmailAccount] = useState("");
  const [emailStatus, setEmailStatus] = useState("unread");
  const [sentOption, setSentOption] = useState("Campaign mail");
  const [sortingOptions, setSortingOptions] = useState("Newest First");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  useEffect(() => {
    const fetchSendersEmails = async () => {
      try {
        const response = await fetchSenderEmailsDetails(userId);
        const result = await response.data.result.map(item => item.user_id);
        setSenderEmails(result);
        setEmailAccount(result[0]);
      } catch (err) {
        console.error("Error in fetching senders emails:", err);
      }
    };
    fetchSendersEmails();
  }, []);

  useEffect(() => {
    setIsValidDate(false);
    setDateError("");

    if (startDate && endDate) {
      const today = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > today || end > today) {
        setDateError('Dates cannot be in the future.');
      } else if (start > end) {
        setDateError('Start date cannot be after end date.');
      } else {
        setIsValidDate(true);
      }
    } else if (startDate && !endDate) {
      const today = new Date();
      const start = new Date(startDate);

      if (start > today) {
        setDateError('Start date cannot be in the future.');
      }
    } else if (!startDate && endDate) {
      const today = new Date();
      const end = new Date(endDate);

      if (end > today) {
        setDateError('End date cannot be in the future.');
      }
    }
  }, [startDate, endDate]);


  useEffect(() => {
    let params = { activeTab, searchTerm, emailAccount, sentOption, emailStatus, sortingOptions, rowsPerPage, currentPage, userId };

    if (isValidDate) {
      params = { ...params, startDate, endDate };
    }

    const filteredParams = filterParams(params);
    setIsOpenCamp(false);
    getManualEmails(filteredParams);

  }, [activeTab, searchTerm, isValidDate, sentOption, emailAccount, emailStatus, sortingOptions, rowsPerPage, currentPage]);


  const getManualEmails = async (filteredParams) => {
    setLoading(true);
    setError("");
    setTotalRows(0);
    setData([]);
    try {
      const response = await fetchManualEmails(filteredParams);
      if (response.data && response.data.length > 0) {
        setTotalRows(response?.totalCount);
        setData(response.data);
      }
    } catch (err) {
      console.error("Error in fetching emails:", err);
      setError("Failed to load emails. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (noOfRows) => {
    setRowsPerPage(noOfRows);
    setCurrentPage(1);
  };

  const handleMenuClickl = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClosel = () => {
    setAnchorEl(null);
  };

  const handleMenuClick2 = (event) => {
    setAnchorE2(event.currentTarget);
  };

  const handleMenuClose2 = () => {
    setAnchorE2(null);
  };

  const filterParams = (params) => {
    return Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value != null && value !== "")
    );
  };

  return (
    <div style={{ margin: "-40px -35px 10px -90px" }}>
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p="32px 32px 16px 24px"
        >
          <Box display="flex" flexDirection="column" alignItems="flex-start">
            <Typography variant="h5" component="h2" fontWeight="bold">
              Mailbox
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {!isOpenCamp ? (
                `${totalRows} Total results`
              ) : (
                'Campaign Details'
              )}
            </Typography>
          </Box>

          {!isOpenCamp && (
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={2}
              width="50%"
            >
              <Box position="relative" width="40%">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Search in Mailbox"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: "20px",
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                />
              </Box>
              <Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box>
                    <IconButton
                      onClick={handleMenuClickl}
                      size="small"
                      sx={{
                        border: "2px solid #e1e1e2",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        padding: "4px 16px",
                      }}
                    >
                      <DateRange />
                      <Typography variant="body2" ml={1}>
                        {startDate ? `${startDate}` : "Start Date"}
                      </Typography>
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClosel}
                    >
                      <MenuItem>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(format(date, "yyyy-MM-dd"))}
                          inline
                        />
                      </MenuItem>
                    </Menu>
                  </Box>
                  <Box>
                    <IconButton
                      onClick={handleMenuClick2}
                      size="small"
                      sx={{
                        border: "2px solid #e1e1e2",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        padding: "4px 16px",
                      }}
                    >
                      <DateRange />
                      <Typography variant="body2" ml={1}>
                        {endDate ? `${endDate}` : "End Date"}
                      </Typography>
                    </IconButton>

                    <Menu
                      anchorE2={anchorE2}
                      keepMounted
                      open={Boolean(anchorE2)}
                      onClose={handleMenuClose2}
                    >
                      <MenuItem>
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(format(date, "yyyy-MM-dd"))}
                          inline
                        />
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>
                {dateError && (
                  <Typography variant="body2" color="error" mt={2}>
                    {dateError}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>

        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          mb={4}
          borderTop="1px solid"
          borderBottom="1px solid"
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="inherit"
            size="small"
            TabIndicatorProps={{
              style: { backgroundColor: "#000", height: "4px" },
            }}
          >
            {["inbox", "sent", "bookmarked", "drafts", "schedule"].map(
              (tab) => (
                <Tab
                  key={tab}
                  label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                  value={tab}
                  sx={{
                    fontWeight: "bold",
                    minWidth: "70px",
                    "&.Mui-selected": {
                      color: "#000",
                    },
                  }}
                />
              )
            )}
          </Tabs>

          {!isOpenCamp && (
            <Box display="flex" gap={1} mt={{ xs: 2, md: 0 }} paddingRight={2}>
              <Select
                defaultValue={senderEmails[0]}
                sx={{
                  padding: "2px",
                  minHeight: "32px",
                  width: "175px",
                  ".MuiSelect-select": {
                    padding: "2px 8px",
                    fontSize: "0.75rem",
                  },
                  ".MuiSelect-icon": {
                    top: "50%",
                    transform: "translateY(-50%)",
                  },
                }}
                IconComponent={ArrowDropDownIcon}
                value={emailAccount}
                onChange={(e) => setEmailAccount(e.target.value)}
              >
                {senderEmails.map((user) => (
                  <MenuItem key={user} value={user}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      padding="2px 8px"
                    >
                      {/* <Avatar
                      alt={user}
                      // src={user.image}
                      sx={{ width: 24, height: 24 }}
                    /> */}
                      <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                        {user.split('@')[0]}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {activeTab === "sent" && (
                <Select
                  defaultValue="Campaign mail"
                  sx={{
                    padding: "2px",
                    minHeight: "32px",
                    width: "175px",
                    ".MuiSelect-select": {
                      padding: "2px 8px",
                      fontSize: "0.75rem",
                    },
                    ".MuiSelect-icon": {
                      top: "50%",
                      transform: "translateY(-50%)",
                    },
                  }}
                  IconComponent={ArrowDropDownIcon}
                  value={sentOption}
                  onChange={(e) => setSentOption(e.target.value)}
                >
                  {sentOptions.map((filter) => (
                    <MenuItem key={filter} value={filter}>
                      <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>)}

              <Select
                defaultValue="Newest First"
                sx={{
                  padding: "2px",
                  minHeight: "32px",
                  width: "175px",
                  ".MuiSelect-select": {
                    padding: "2px 8px",
                    fontSize: "0.75rem",
                  },
                  ".MuiSelect-icon": {
                    top: "50%",
                    transform: "translateY(-50%)",
                  },
                }}
                IconComponent={ArrowDropDownIcon}
                size="small"
                onChange={(e) => setSortingOptions(e.target.value)}
              >
                {sortingOption.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : data && data.length > 0 ? (
        <>
          {activeTab === "inbox" && data && (<InboxMail props={{ data }} />)}
          {activeTab === "bookmarked" && data && (<BookMarkedMail props={{ data }} />)}
          {activeTab === "sent" && sentOption === "Campaign mail" && data && (<SentMail props={{ data }} setIsOpenCamp={setIsOpenCamp} />)}
          {activeTab === "sent" && sentOption === "Replied mail" && data && (<RepliedSentMail props={{ data }} />)}
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      ) : (
        <Typography align="center" variant="body1">
          No Data Found
        </Typography>
      )}
    </div>
  );
};

export default ManualMail;
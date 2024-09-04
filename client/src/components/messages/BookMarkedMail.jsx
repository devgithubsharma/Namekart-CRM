import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar,
  Box, Dialog, IconButton, Tooltip
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import MailChatBox from "../../components/messages/MailChatBox";
import {removeFromBookmark, addToBookmark} from "../../api";

export default function BookMarkedMail({ props }) {
  const { data } = props;
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [bookmarkedRows, setBookmarkedRows] = useState(() => {
    const initialBookmarks = new Set();
    data.forEach((row) => {
      if (row.isBookMarked === 1) {
        initialBookmarks.add(row);
      }
    });
    return initialBookmarks;
  });

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handleBookmarkClick = async (row, event) => {
    event.stopPropagation();
    const updatedBookmarks = new Set(bookmarkedRows);
  
    try {
      if (updatedBookmarks.has(row)) {
        await removeFromBookmark(row.threadId);
        updatedBookmarks.delete(row);
        console.log(`Removed bookmark from:`, row);
      } else {
        await addToBookmark(row.threadId);
        updatedBookmarks.add(row);
        console.log(`Bookmarked:`, row);
      } 
      setBookmarkedRows(updatedBookmarks);
    } catch (error) {
      console.error(`Failed to update bookmark for threadId ${row.threadId}:`, error);
      alert(`Error: Unable to update bookmark for this sender ${row.sender}.`);
    }
  };
  

  return (
    <Box sx={{ padding: '4px 20px' }}>
      <Dialog open={open} onClose={handleClose}>
        <MailChatBox props={selectedRow} />
      </Dialog>
      <TableContainer component={Paper} sx={{ maxHeight: 370, border: '1px solid #f0f0f0' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ maxWidth: 60, height: 30, border: '1px solid #f0f0f0', fontWeight: 'bold', padding: '1px 2px 1px 8px', backgroundColor: '#f8f8f8', fontFamily: 'inherit', fontSize: '12px' }}>
                  BOOKMARK
              </TableCell>
              <TableCell sx={{ minWidth: 150, height: 30, border: '1px solid #f0f0f0', fontWeight: 'bold', padding: '1px 2px 1px 12px', backgroundColor: '#f8f8f8', fontFamily: 'inherit', fontSize: '12px' }}>
                DOMAIN NAME
              </TableCell>
              <TableCell sx={{ minWidth: 100, height: 30, border: '1px solid #f0f0f0', fontWeight: 'bold', padding: '1px 2px 1px 12px', backgroundColor: '#f8f8f8', fontFamily: 'inherit', fontSize: '12px' }}>
                SENDER
              </TableCell>
              <TableCell sx={{ minWidth: 150, height: 30, border: '1px solid #f0f0f0', fontWeight: 'bold', padding: '1px 2px 1px 12px', backgroundColor: '#f8f8f8', fontFamily: 'inherit', fontSize: '12px' }}>
                SUBJECT
              </TableCell>
              <TableCell sx={{ minWidth: 200, height: 30, border: '1px solid #f0f0f0', fontWeight: 'bold', padding: '1px 2px 1px 12px', backgroundColor: '#f8f8f8', fontFamily: 'inherit', fontSize: '12px' }}>
                MESSAGE
              </TableCell>
              <TableCell sx={{ minWidth: 100, height: 30, border: '1px solid #f0f0f0', fontWeight: 'bold', padding: '1px 2px 1px 12px', backgroundColor: '#f8f8f8', fontFamily: 'inherit', fontSize: '12px' }}>
                QUICK REPLY
              </TableCell>
              <TableCell sx={{ minWidth: 100, height: 30, border: '1px solid #f0f0f0', fontWeight: 'bold', padding: '1px 2px 1px 12px', backgroundColor: '#f8f8f8', fontFamily: 'inherit', fontSize: '12px' }}>
                DATE
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={index} onClick={() => handleRowClick(row)}>
                <TableCell sx={{ minWidth: 60, height: 30, padding: '1px 2px 1px 8px', border: '1px solid #f0f0f0', fontSize: '12px', fontFamily: 'inherit', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <BookmarkIcon
                    isBookmarked={bookmarkedRows.has(row)}
                    onClick={(event) => handleBookmarkClick(row, event)}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 150, height: 30, padding: '1px 2px 1px 12px', border: '1px solid #f0f0f0', fontSize: '12px', fontFamily: 'inherit' }}>
                  {row.domainName}
                </TableCell>
                <TableCell sx={{ minWidth: 100, height: 30, padding: '1px 2px 1px 12px', border: '1px solid #f0f0f0', fontSize: '12px', fontFamily: 'inherit' }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>{row.sender}</Avatar>
                </TableCell>
                <TableCell sx={{ minWidth: 150, height: 30, padding: '1px 2px 1px 12px', border: '1px solid #f0f0f0', fontSize: '12px', fontFamily: 'inherit' }}>
                  {row.subject}
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 250,
                    height: 30,
                    padding: '1px 2px 1px 12px',
                    border: '1px solid #f0f0f0',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {row?.message?.length > 40
                    ? `${row?.message?.substring(0, 40)}...`
                    : row?.message
                  }
                </TableCell>

                <TableCell sx={{ minWidth: 100, height: 30, padding: '1px 2px 1px 12px', border: '1px solid #f0f0f0', fontSize: '12px', fontFamily: 'inherit' }}>
                  {/* {row.quickReply} */}
                  <Box display="flex">
                          <CircleIcon sx={{ color: 'red', fontSize: '12px', marginRight: '4px' }} />
                          <CircleIcon sx={{ color: 'green', fontSize: '12px', marginRight: '4px' }} />
                          <CircleIcon sx={{ color: 'blue', fontSize: '12px' }} />
                        </Box>
                </TableCell>
                <TableCell sx={{ minWidth: 100, height: 30, padding: '1px 2px 1px 12px', border: '1px solid #f0f0f0', fontSize: '12px', fontFamily: 'inherit' }}>
                  {row.date}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}


const BookmarkIcon = ({ isBookmarked, onClick }) => (
  <Tooltip title="Bookmark">
    <IconButton onClick={onClick}>
      {isBookmarked ? <StarIcon color="primary" /> : <StarBorderIcon />}
    </IconButton>
  </Tooltip>
);


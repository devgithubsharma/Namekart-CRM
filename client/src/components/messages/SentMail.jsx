import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import CampMailDetails from "../../components/messages/CampMailDetails";

const columns = [
  { id: "date", label: "DATE", minWidth: 70 },
  { id: "campaignName", label: "CAMPAIGN NAME", minWidth: 70 },
  { id: "domains", label: "DOMAINS", minWidth: 70 },
  { id: "leads", label: "LEADS", minWidth: 70 },
  { id: "emails", label: "EMAILS", minWidth: 70 },
  { id: "opened", label: "OPENED", minWidth: 70 },
  { id: "unsubscribed", label: "UNSUBSCRIBED", minWidth: 70 },
  { id: "bounced", label: "BOUNCED", minWidth: 70 },
  { id: "clicked", label: "CLICKED", minWidth: 70 },
];

export default function SentMail({ props, setIsOpenCamp}) {
  const { data } = props;

  const [selectedCamp, setSelectedCamp] = useState(null);

  const handleRowClick = (row) => {
    setSelectedCamp(row);
    setIsOpenCamp(true);
  };
  const handleBackClick = () => {
    setSelectedCamp(null);
    setIsOpenCamp(false);
  }

  return (
    <Box sx={{ padding: "4px 20px" }}>
      {selectedCamp ? (
        <CampMailDetails campData={selectedCamp}  handleBackClick={handleBackClick} />
      ) : (
        <TableContainer
          component={Paper}
          sx={{ maxHeight: 370, border: "1px solid #f0f0f0" }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      minWidth: 70,
                      height: 30,
                      border: "1px solid #f0f0f0",
                      fontWeight: "bold",
                      padding: "1px 2px 1px 12px",
                      backgroundColor: "#f8f8f8",
                      fontFamily: "inherit",
                      fontSize: "12px",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((row, index) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={index}
                  onClick={() => handleRowClick(row)}
                  sx={{ cursor: "pointer" }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={column.id}
                        sx={{
                          minWidth: 70,
                          height: 30,
                          padding: "1px 2px 1px 12px",
                          border: "1px solid #f0f0f0",
                          fontSize: "12px",
                          fontFamily: "inherit",
                        }}
                      >
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}


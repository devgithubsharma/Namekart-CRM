// ReceivingEmail.jsx
import React, { useState, useEffect } from 'react';
import receivingEmail from '../data/receivingEmails'
import { useDrag, useDrop } from 'react-dnd';

// const ROW_TYPE = 'ROW';

const Row = ({ row, index, moveRow }) => {
    const [, ref] = useDrag({
      type: 'ROW',
      item: { index },
    });
  
    const [, drop] = useDrop({
      accept: 'ROW',
      hover: (draggedItem) => {
        if (draggedItem.index !== index) {
          moveRow(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    });
  
    return (
      <tr ref={(node) => ref(drop(node))}>
        <td>{row.sender}</td>
        <td>{row.receiver}</td>
        <td>{row.date}</td>
        <td>{row.subject}</td>
        <td>{row.messageBody}</td>
        <td>{row.category}</td>
      </tr>
    );
  };

const ReceivingEmail = () => {
  // Assuming you have a state to hold the list of receiving emails
  const [receivingEmails, setReceivingEmails] = useState([]);

  useEffect(() => {
    // Fetch receiving emails from your backend or use a sample data
    // For example, you can replace this with an API call using axios or fetch
    const fetchReceivingEmails = async () => {
      try {
        // Replace 'https://example.com/api/getReceivingEmails' with your actual API endpoint
        const response = await fetch('http://localhost:3001/api/receivingEmails');
        const data = await response.json();

        // Assuming the data structure is an array of emails
        setReceivingEmails(data);
      } catch (error) {
        console.error('Error fetching receiving emails:', error);
      }
    };

    // Call the function to fetch receiving emails
    fetchReceivingEmails();
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

const moveRow = (fromIndex, toIndex) => {
    const updatedRows = [...receivingEmails];
    const movedRow = updatedRows[fromIndex];

    // Remove the row from the original position
    updatedRows.splice(fromIndex, 1);

    // Insert the row at the new position
    updatedRows.splice(toIndex, 0, movedRow);

    setReceivingEmails(updatedRows);
  };

  return (
    <div>
      <h2>Receiving Emails</h2>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Date</th>
            <th>Subject</th>
            <th>MessageBody</th>
            <th>Category</th>
            {/* Add more column headers as needed */}
          </tr>
        </thead>
        <tbody>
          {receivingEmails.map((row, index) => (
           <Row key={row.id} row={row} index={index} moveRow={moveRow} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReceivingEmail;

// ContactsTable.jsx
import React from 'react';

function ContactsTable({ contactsData }) {
    // console.log(contactsData)
  return (
    <div>
      {/* <h2>Contacts</h2> */}
      <table>
        <thead>
          <tr>
            <th>Contact</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {contactsData.map((email, index) => (
            <tr key={index}>
              <td>{email}</td>
              <td>null</td> 
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContactsTable;

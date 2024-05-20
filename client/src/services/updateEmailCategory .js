// api.js
import axios from 'axios';

export const updateEmailCategory = async (emailId, category) => {
  try {
    // Replace 'https://example.com/api/updateEmailCategory' with your actual API endpoint
    await axios.put('https://example.com/api/updateEmailCategory', {
      emailId,
      category,
    });

    // Handle the response as needed
  } catch (error) {
    console.error('Error updating email category:', error);
    throw error; // Propagate the error to the calling code
  }
};

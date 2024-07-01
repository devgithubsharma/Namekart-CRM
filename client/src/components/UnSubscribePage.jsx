import React, {  useEffect } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';

function UnSubscribePage() {
  const { campId,mailId } = useParams();
  console.log(campId,mailId)

    useEffect(()=>{
        const updateUnsubscribeStatus = async () =>{
            try{
                const response = await axios.put(`https://crmapi.namekart.com/api/updateUnsubscribeStatus/${campId}/${mailId}`);
                console.log(response)

            }catch(err){
                console.log('Error in updateUnsubscribeStatus',err)
            }
        }
        updateUnsubscribeStatus();
    },[campId,mailId])

  return (
    <div className='unSubscribePage'>
      <h2>Thanks for Unsubscribing</h2>
    </div>
  )
}

export default UnSubscribePage

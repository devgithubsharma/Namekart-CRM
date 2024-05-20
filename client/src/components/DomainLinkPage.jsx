import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Navigate } from "react-router-dom";
import axios from 'axios';

function DomainLinkPage() {
    const { campId,mailId,domainLink } = useParams();
    useEffect(()=>{
        const redirectDomainLink = async () =>{
            try{
                
                const response = await axios.get(`http://localhost:3001/api/updateDomainLinkStatus/${campId}/${mailId}`);
                if(domainLink){
                    // const decodedDomainLink = decodeURIComponent(domainLink);
                    console.log(domainLink);
                    window.location.href = domainLink;
                    // <Navigate to={`${domainLink}`} replace={true}/>
                }
                console.log(response)

            }catch(err){ 
                console.log('Error in Updating Domain Link Status');
            }
        }
        redirectDomainLink();
    },[campId,mailId,domainLink])

  return (
    <div>
      <h2>Domain Link Page</h2>
    </div>
  )
}

export default DomainLinkPage;

const dbConnection = require('../dbConnection'); 

const deleteStep = async (req,res)=>{
    const stepId = req.params.stepId
    const seqId = req.params.sequenceId
    let connection;
    try{
        connection = await dbConnection.getConnection();
        const query = 'DELETE FROM steps WHERE step_id = ? and sequenceId = ?';
        await connection.query(query,[stepId,seqId],(err,result)=>{
            if(err){
                console.log("Error in deleting step",err)
            }else{
                console.log("Step deleted successfully",result)
                res.status(200).json({message:"Step deleted successfully"})
            }
        })
        // res.status(200).json({message:"Step deleted successfully"})
    }catch(err){
        console.log("Error in deleting step",err)
        res.status(500).json({message:"Error in deleting step"})
    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {
    deleteStep,
}


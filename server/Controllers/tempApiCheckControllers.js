const schedule = require('node-schedule');
const { format } = require('date-fns');


// const formattedDate = format(now, 'yyyy-MM-dd HH:mm:ss');
const tempApi = async (req,res) =>{
    const startTime = new Date(Date.now() + 5000);
const endTime = new Date(startTime.getTime() + 5000);
console.log("startTime",startTime)
console.log("endTime",endTime)
    
    try{
        // console.log(now>new Date())
        schedule.scheduleJob(startTime,function(){
            console.log('Sending email is working')
            res.status(200).json({message:'Api is working'})
        })
        
    }catch(err){
        console.log(err)
        res.json({"Error":err})
    }
    
    
}

module.exports = {
    tempApi,
}


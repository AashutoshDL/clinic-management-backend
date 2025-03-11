//autocomplete api for different fields like medicines, disease, condition and procedure
const {errorResponse}= require('../../utils/responseHandler');

module.exports.medicines = async(req,res)=>{
    const {query}=req.query

    if(!query || query.length < 3){
        return res.json([]);
    }

    try{
        const response=await fetch(`${process.env.API_medicines}?terms=${query}`);
        const data=await response.json();
        const medicines=data[3] || [];

        res.json(medicines.map(medicines=>medicines[0]));
    }catch(error){
        errorResponse(res,500,"Internal Server Error")
    }
}
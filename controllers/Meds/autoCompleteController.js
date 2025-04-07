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

module.exports.diseases = async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 3) {
    return res.json([]);
  }

  try {
    const apiURL = `${process.env.API_disease}&terms=${query}`;
    const response = await fetch(apiURL);
    const data = await response.json();

    const diseases = data[3] || [];
    const result = diseases.map(d => d[0]); // d is an array like ["Bone cancer"]

    res.json(result);
  } catch (error) {
    errorResponse(res, 500, "Internal Server Error");
  }
};

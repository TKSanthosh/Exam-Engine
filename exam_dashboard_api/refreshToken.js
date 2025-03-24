const axios = require('axios');
require('dotenv').config();
const db = require("../connect")

const refreshToken = async () => {
    try {
        const getExamDetails = async ()=>{
            return new Promise((resolve,reject)=>{
                db.query("SELECT centre_code, serial_no FROM refresh_tokens ORDER BY id DESC LIMIT 1",(err,result)=>{
                    if(err){
                        reject(err)
                    }
                    console.log(result[0]);
                    resolve({centre_code: result[0].centre_code,serial_no : result[0].serial_no})
                })
            })
        }
        const {centre_code,serial_no} = await getExamDetails();

        const getRefreshToken = async (centre_code,serial_no)=>{
            return new Promise((resolve,reject)=>{
                db.query("SELECT token FROM refresh_tokens WHERE centre_code = ? AND serial_no = ? order by id DESC LIMIT 1", [centre_code, serial_no],(err,result)=>{
                    if(err){
                        reject(err)
                    }
                    console.log(result[0]);
                    resolve({rtData: result[0].token})
                })
            })
        }
        const {rtData} = await getRefreshToken(centre_code,serial_no);

         const response = await axios.post(`${process.env.EXAM_DASHBOARD_URL}/examEngineRefresh`, 
                    { rtData: rtData });
                
        return response.data.at;

    } catch (error) {
        console.error("Error refreshing token: ", error);
        throw error;
    }
}

module.exports = refreshToken;
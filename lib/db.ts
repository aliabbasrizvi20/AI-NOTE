import mongoose from "mongoose";
let isConnecteed=false;
export const ConnectToDB=async()=>{
if(isConnecteed)return;
    await mongoose.connect(process.env.MONGO_URI!,{
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    })
    isConnecteed=true;
    console.log("Mongoose Connected!");
}

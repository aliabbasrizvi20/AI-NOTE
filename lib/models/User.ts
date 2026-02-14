import { timeStamp } from "console";
import mongoose,{Schema,model,models} from "mongoose";
import { unique } from "next/dist/build/utils";
import { required } from "zod/mini";

    const userSchema=new Schema(
        {
        name:{type:"String",},
        email:{type:"String",required:true,unique:true,},
        password:{type:"String",required:true,},
        
    },
    {
        timestamps:true
    }

);

export const NoteUser = models.NoteUser || model("NoteUser", userSchema);
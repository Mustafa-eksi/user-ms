import mongoose, {connection} from 'mongoose';

mongoose.connect('mongodb://127.0.0.1/Eticaret').then((v:any)=>{
    console.log("connected to mongodb!")
}).catch((err)=>{console.error("DB ERR: Can't connect to mongodb\n")})

export {connection}
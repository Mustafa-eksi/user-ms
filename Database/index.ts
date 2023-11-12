import mongoose, {connection} from 'mongoose';
import config from '../config';

mongoose.connect(config.MONGO_CONNECTION).then((v:any)=>{
    console.log("connected to mongodb!")
}).catch((err)=>{console.error("DB ERR: Can't connect to mongodb\n")})

export {connection}
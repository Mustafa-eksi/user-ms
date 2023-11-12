import { Permissions, UserModel, Users } from "../Database/Models/UserModel";
import { CheckPermissionJoi, RegisterRequest } from "./Validators/UserValidate";
import * as bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import config from "../config";

export async function LogicRegister(request: any): Promise<Error | boolean> {
    let validated = await RegisterRequest.validateAsync(request).catch((err)=>{throw err});
    console.log(validated);
    if(validated.error) {
        console.log(validated.error)
        return new Error("Validation error");
    }
    let other_user = await UserModel.findOne({username: validated.username});
    if(other_user) {
        return new Error("Username is not unique");
    }
    let hashedPassword = await bcrypt.hash(validated.password, 0);
    await UserModel.insertMany({
        username: validated.username,
        password: hashedPassword,
        permissions: [{module_name: "product-ms", permitted_actions: ["listAll"]} as Permissions] 
    } as Users).catch((err)=>{
        if(err) return Error("Couldn't create user in database");
    });
    return true;
}

export async function LogicLogin(request: any): Promise< Error | string > {
    let validated = await RegisterRequest.validateAsync(request);
    console.log(validated);
    /*if(validated.error) {
        console.log(validated.error)
        return new Error("Validation error");
    }*/
    let user = await UserModel.findOne({username: validated.username});
    if(!user) {
        throw new Error("This user doesn't exists!");
    }
    let userObj = user.toObject();
    if(!(await bcrypt.compare(validated.password, userObj.password))) {
        throw new Error("Authorization Error: password is incorrect");
    }
    let token = JWT.sign({username: userObj.username, permissions: userObj.permissions}, config.JWT_SECRET, {expiresIn: config.TOKEN_TIMEOUT});
    return token;
} 

export function ComparePermissions(user_permissions: Permissions[], needed_permission: Permissions): boolean {
    let user_p = user_permissions.find(x => x.module_name == needed_permission.module_name);
    if(!user_p) return false;
    let permission_doesnt_exist = false;
    needed_permission.permitted_actions.forEach((v)=>{ // v = add | create
        if(!user_p!.permitted_actions.includes(v)) {
            permission_doesnt_exist = true;
        }
    })
    return !permission_doesnt_exist;
}

export function PermissionEqual(per1: Permissions[], per2: Permissions[]): boolean {
    if(per1.length !== per2.length) return false;
    per1.forEach((v)=>{
        let v_p = per2.findIndex(x => x.permitted_actions.toString() === v.permitted_actions.toString() && v.module_name === x.module_name);
        if(v_p === -1) {
            return false;
        }
    }) 
    return true;
}

export async function CheckPermissions(request: any): Promise<Error | boolean> {
    let validated = await CheckPermissionJoi.validateAsync(request);
    if(!validated) throw Error("Validation error");
    let data = JWT.verify(validated.token, config.JWT_SECRET)
    return ComparePermissions(data., validated.needed_permission);
}

/*
 [
    {module_ismi: "", yetki_alanı: ["remove", "add", "create"]}
 ]

 {yetki_bir:}
*/
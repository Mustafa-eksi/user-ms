import { Permissions, UserModel, Users } from "../Database/Models/UserModel";
import { CheckPermissionJoi, RegisterRequest, AddPermissionJoi } from "./Validators/UserValidate";
import * as bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import config from "../config";
import Joi from "joi";

export async function LogicRegister(requestBody: any): Promise<Error | boolean> {
    let validated = await RegisterRequest.validateAsync(requestBody).catch((err)=>{throw err});
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

export async function LogicLogin(requestBody: any): Promise< Error | string > {
    let validated = await RegisterRequest.validateAsync(requestBody);
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

// TODO: Write unit tests.

export function PermissionEqual(per1: Permissions[], per2: Permissions[]): boolean {
    // Returns true if per1 == per2, returns false otherwise.
    if(per1.length !== per2.length) return false;
    for(let i1 = 0; i1 < per1.length; i1++) {
        let module2 = per2.find( x => x.module_name === per1[i1].module_name);
        if(!module2) return false; // continue if some module in per1 doesn't exist in per2, since per1 can be broader than per2.
        if(per1[i1].permitted_actions.length !== module2.permitted_actions.length) return false;
        // Check if permitted actions arrays are equal or greater. per1[i1].permitted_actions >= module2.permitted_actions
        for(let i2 = 0; i2 < module2.permitted_actions.length; i2++) {
            if(!per1[i1].permitted_actions.includes(module2.permitted_actions[i2])) {
                return false;
            }
        }
    }
    return true;
}

export function PermissionEqualorGreater(per1: Permissions[], per2: Permissions[]): boolean {
    // Returns true if per1 >= per2, returns false otherwise.
    if(per1.length < per2.length) return false;
    for(let i1 = 0; i1 < per1.length; i1++) {
        let module2 = per2.find( x => x.module_name === per1[i1].module_name);
        if(!module2) continue; // continue if some module in per1 doesn't exist in per2, since per1 can be broader than per2.
        if(per1[i1].permitted_actions.length < module2.permitted_actions.length) return false;
        // Check if permitted actions arrays are equal or greater. per1[i1].permitted_actions >= module2.permitted_actions
        for(let i2 = 0; i2 < module2.permitted_actions.length; i2++) {
            if(!per1[i1].permitted_actions.includes(module2.permitted_actions[i2])) {
                return false;
            }
        }
    }
    return true;
}

export async function CheckPermissions(requestBody: any): Promise<boolean> {
    let validated = await CheckPermissionJoi.validateAsync(requestBody);

    let data = JWT.verify(validated.value.token, config.JWT_SECRET);
    if(typeof data === 'string') throw new Error("JWT verification failed (or succeeded but returned a string): " + data);

    return ComparePermissions(data.permissions, validated.value.needed_permission);
}

export async function LogicAddPermission(requestBody: any): Promise<boolean> {
    let validated = await AddPermissionJoi.validateAsync(requestBody);
    let user = JWT.verify(validated.token, config.JWT_SECRET);
    // user.permissions >= validated.permit
    if(typeof user === 'string') throw new Error("JWT verification failed (or succeeded but returned a string): " + user);
    if(PermissionEqualorGreater(user.permissions, validated.permit)) {
        // Add permission
        
        return true;
    }else {
        return false;
    }
}
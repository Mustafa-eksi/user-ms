import { Permissions, UserModel, Users } from "../Database/Models/UserModel";
import { CheckPermissionJoi, RegisterRequest, AddPermissionJoi } from "./Validators/UserValidate";
import { addPermission, ComparePermissions, PermissionEqualorGreater, unionPermissions } from "./Permission";
import * as bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import config from "../config";
import { CheckPermissionDatabase } from "../Database/helpers/User";

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

    // NOTE: I should update this if I decide to go with tokens with custom subsets of user's permissions.   
    if(!(await CheckPermissionDatabase(user.username, user.permissions))) throw new Error("Your token is out to date or doesn't include all of your permissions.");

    if(!PermissionEqualorGreater(user.permissions, validated.permit)) { // Means you don't have permission to give these permissions.
        return false;
    }
    let addTo = await UserModel.findOne({username: validated.add_to});
    if(!addTo) throw new Error("This user doesn't exist: " + validated.username)
    let new_permissions = unionPermissions(addTo.permissions, validated.permit);
    await UserModel.findOneAndUpdate(
        { username: validated.add_to }, // Filter
        { permissions: new_permissions } // Update
    );

    return true;
}
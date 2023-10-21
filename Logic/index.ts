import { Permissions, UserModel, Users } from "../Database/Models/UserModel";
import { CheckPermissionJoi, RegisterRequest } from "./Validators/UserValidate";

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
    await UserModel.insertMany({
        username: validated.username,
        password: validated.password,
        permissions: [{module_name: "product-ms", permitted_actions: ["listAll"]} as Permissions] 
    } as Users).catch((err)=>{
        if(err) return Error("Couldn't create user in database");
    });
    return true;
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

export async function CheckPermissions(request: any): Promise<Error | boolean> {
    let validated = await CheckPermissionJoi.validateAsync(request).catch((err)=>{return new Error("Validation error")})
    if(validated.error) {
        console.log(validated.error)
        return new Error("Validation error");
    }
    let user = await UserModel.findOne({username: validated.username, password: validated.password}).catch((err)=>{
        return new Error("Database error");
    });
    if(!user || !(user instanceof Users)) return false;
    return ComparePermissions(user.permissions, validated.needed_permission);
}

/*
 [
    {module_ismi: "", yetki_alanı: ["remove", "add", "create"]}
 ]

 {yetki_bir:}
*/
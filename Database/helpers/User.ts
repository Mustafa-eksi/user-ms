import { PermissionEqual } from "../../Logic/Permission";
import { UserModel, Permissions } from "../Models/UserModel"

export async function CheckPermissionDatabase(username: string, perms: Permissions[]): Promise<boolean> {
    let user = await UserModel.findOne({
        username: username
    });
    if(!user) throw new Error("This user doesn't exist!");
    return PermissionEqual(user.permissions, perms);
}
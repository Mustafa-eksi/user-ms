import { Permissions } from "../Database/Models/UserModel";

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

function arrayUnion<T>(arr1: Array<T>, arr2: Array<T>): Array<T> {
    let arr3 = arr1;
    for(let i = 0; i < arr2.length; i++) {
        if(!arr3.includes(arr2[i])) {
            arr3.push(arr2[i]);
        }
    }
    return arr3;
}

function arrayIntersection<T>(arr1: Array<T>, arr2: Array<T>): Array<T> {
    return arr1.filter(x => arr2.includes(x)); // FIXME: objects are probably not going to pass that
}

// NOTE: add can have multiple actions.
export function addPermission(to: Permissions[], add: Permissions): Permissions[] {
    let perms = to;
    // check if add.module_name exist in perms:
    let mi = perms.findIndex(x => x.module_name === add.module_name);
    if(mi !== -1) {
        // We're not simply adding array because permissions aren't arrays, they're sets.
        perms[mi].permitted_actions = arrayUnion<string>(perms[mi].permitted_actions, add.permitted_actions);
    }else {
        perms.push(add);
    }
    return perms;
}

export function unionPermissions(p1: Permissions[], p2: Permissions[]): Permissions[] {
    let p3 = p1;
    for(let i = 0; i < p2.length; i++) {
        p3 = addPermission(p3, p2[i]);
    }
    return p3;
}

// FIXME: handle edge cases for above functions
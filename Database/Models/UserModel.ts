import { prop, getModelForClass, modelOptions, Ref } from '@typegoose/typegoose'

export class Permissions { // FIXME: Rename to "Permission"
    @prop({required:true})
    public module_name!: string;
    @prop({required:true})
    public permitted_actions!: string[];
}

@modelOptions({options: {customName: "users"}})
export class Users {
    @prop({required:true, unique:true})
    public username!: string;

    @prop({required:true})
    public password!: string;

    @prop({required:true})
    public permissions!: Permissions[];
}

export const UserModel = getModelForClass(Users)
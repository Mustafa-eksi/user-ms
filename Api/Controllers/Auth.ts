import { LogicRegister } from "../../Logic";

export async function AuthRegister(req: any, res: any, next: any) {
    //console.log(req);
    let result = await LogicRegister(req.body);
    if(typeof result == "boolean") {
        return res.send({res: result})
    } else {
        res.send({res: false, error: result.message});
    }
    
}

export async function AuthCheckPermission(req: any, res:any, next: any) {
    
}
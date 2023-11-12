import { LogicRegister } from "../../Logic";

export async function AuthRegister(req: any, res: any, next: any) {
    // FIXME: replace this with a beautiful await syntax
    let result = await LogicRegister(req.body).then((result)=>{
        return res.send({res: result})
    }).catch((err)=>{
        res.send({res: false, error: err});
    });
}

export async function AuthCheckPermission(req: any, res:any, next: any) {
    
}
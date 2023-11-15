import { CheckPermissions, LogicLogin, LogicRegister, LogicAddPermission } from "../../Logic";

export async function AuthRegister(req: any, res: any, next: any) {
    // FIXME: replace this with a beautiful await syntax
    LogicRegister(req.body).then((result)=>{
        return res.send({res: result})
    }).catch((err)=>{
        res.send({res: false, error: err});
    });
}

export function AuthCheckPermission(req: any, res:any, next: any) {
    CheckPermissions(req.body).then((v)=>{
        return res.send({res: v});
    }).catch((err)=>{
        if(err) {
            res.send({res: false, error: err});
        }
    });
}

export async function AuthLogin(req: any, res: any, next: any) {
    // FIXME: replace this with a beautiful await syntax
    LogicLogin(req.body).then((result)=>{
        return res.send({res: result})
    }).catch((err)=>{
        if(err) res.send({res: false, error: err});
    });
}

export async function AuthAddPermission(req: any, res: any, next: any) {
    LogicAddPermission(req.body).then((v)=>{
        res.send({res: v});
    }).catch((err)=>{
        if(err){
            console.log(err); // Debug only
        }
    })
}
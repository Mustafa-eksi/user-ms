import { addPermission, ComparePermissions, createPermissions, PermissionEqual, PermissionEqualorGreater, unionPermissions } from './Permission'

let test_no = 0;
function test(desc: string, test_case: () => boolean) {
    if(test_case()) {
        console.log(test_no+". ✅ " + desc + " PASSED")
    }else {
        console.log(test_no+" ❌ " + desc + " FAILED")
    }
    test_no++;
}

const permission1 = createPermissions('module1', ['read', 'write']);
const permission2 = createPermissions('module1', ['read', 'write']);
const permission3 = createPermissions('module2', ['read', 'write']);
const permission4 = createPermissions('module1', ['read', 'execute']);
const permission5 = createPermissions('module1', ['read']);

test("ComparePermissions([p1,p2], p3) === false", ()=> {
    return ComparePermissions([permission1, permission2], permission3) === false;
})

test("ComparePermissions([p2, p1], p1) === true", ()=> {
    return ComparePermissions([permission2, permission1], permission1) === true;
})

test("ComparePermissions([p1], p3) === false", ()=> {
    return ComparePermissions([permission1], permission3) === false;
})

test("PermissionEqual(p1, p2) === true", ()=>{
    return PermissionEqual(permission1, permission2) === true;
})

test("PermissionEqual(p1, p5) === false", ()=>{
    return PermissionEqual(permission1, permission5) === false;
})

test("PermissionEqual(p2, p3) === false", ()=>{
    return PermissionEqual(permission2, permission3) === false;
})

test("PermissionEqual(p1, p4) === false", ()=>{
    return PermissionEqual(permission1, permission4) === false;
})

// TODO: write more unit tests, maybe use chatgpt to generate them.
import { Router } from 'express';
import { AuthCheckPermission, AuthRegister, AuthLogin } from '../Controllers/Auth';

const router = Router();

router.post("/register", AuthRegister);
router.post("/checkPermisson", AuthCheckPermission);
router.post("/login", AuthLogin);

export { router };
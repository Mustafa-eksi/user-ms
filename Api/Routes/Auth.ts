import { Router } from 'express';
import { AuthCheckPermission, AuthRegister } from '../Controllers/Auth';

const router = Router();

router.post("/register", AuthRegister);
router.post("/checkPermisson", AuthCheckPermission);

export { router };
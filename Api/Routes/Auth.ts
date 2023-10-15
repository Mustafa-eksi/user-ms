import { Router } from 'express';
import { AuthRegister } from '../Controllers/Auth';

const router = Router();

router.get("/register", AuthRegister);


export { router };
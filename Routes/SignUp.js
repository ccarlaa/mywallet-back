import { Router } from "express";
import { signUp } from "../Controllers/SignUp.js";
import signUpMiddleware from "../Middleware/SignUpMiddleware.js";

const signUpRouter = Router();

signUpRouter.post('/sign-up', signUpMiddleware, signUp);

export default signUpRouter;
import { Router } from "express";
import { signIn } from "../Controllers/SignIn.js";
import signInMiddlware from "../Middleware/SignInMiddleware.js";

const signInRouter = Router();

signInRouter.post('/sign-in', signInMiddlware, signIn);

export default signInRouter;
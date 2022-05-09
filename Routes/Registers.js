import { Router } from "express";
import { getRegisters, postRegisters } from "../Controllers/Registers.js";
import postRegistersMiddleware from "../Middleware/PostRegistersMiddleware.js"
import getRegistersMiddleware from "../Middleware/GetRegistersMiddleware.js"

const registersRouter = Router();

registersRouter.post('/register', postRegistersMiddleware, postRegisters);
registersRouter.get('/register', getRegistersMiddleware, getRegisters);

export default registersRouter;
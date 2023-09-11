import express from "express";
import { createUser, deleteUser, login } from "../controllers/userController";

const router = express.Router();

router.post("/signup", createUser);
router.post("/login", login);
router.delete("/delete/:id", deleteUser);

export default router;

import express, { Request, Response } from "express";
import { deleteUserByEmail } from "../models/user";

const router = express.Router();

router.delete(
  "/api/users/deleteUser",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const currentUser = req.body;
      const email = currentUser.email;
      if (!email) {
        return res.status(400).json({ error: "The user does not exist" });
      }
      await deleteUserByEmail(email);
      req.session = null;
      return res.status(200).json({ success: true, message: "User removed" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to remove user" });
    }
  }
);

export { router as deleteUserRouter };

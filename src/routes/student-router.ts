import express, { Request, Response } from "express";
import { validateData } from "../middlewares/validation-middleware";
import {
  studentAuthSchema,
  studentRegSchema,
} from "../schemas/student-schemas";
import { authGuard } from "../middlewares/auth-guard";
import path from "path";
import StudentService from "../services/student-service";
import { AuthStudentDTO, RegStudentDTO } from "../dtos/dtos";
import { StatusCodes } from "http-status-codes";
import { HttpError } from "http-errors";

const studentService = new StudentService();

const studentRouter = express.Router();

studentRouter.get("/register", (_, res: Response) => {
  const paths = path.join(__dirname, "..", "..", "static", "register.html");
  res.sendFile(paths);
});

studentRouter.post(
  "",
  validateData(studentRegSchema),
  async (req: Request, res: Response) => {
    const dto = req.body as RegStudentDTO;
    const newStudent = await studentService
      .registerStudent(dto)
      .catch((error: HttpError) => {
        res.status(error.statusCode).json(error.message);
      });
    res.status(StatusCodes.CREATED).json(newStudent);
  }
);

studentRouter.post(
  "/auth",
  validateData(studentAuthSchema),
  async (req: Request, res: Response) => {
    const dto = req.body as AuthStudentDTO;
    const payload = await studentService
      .authorizeStudent(dto)
      .catch((error: HttpError) => {
        res.status(error.statusCode).json(error.message);
      });
    res.status(StatusCodes.CREATED).json(payload);
  }
);

studentRouter.get(
  "/referral",
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const result = studentService.genReferralLink(req);
      res.json(result);
    } catch (error) {
      res.send(error);
    }
  }
);

export default studentRouter;

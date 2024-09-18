import express, { Request, Response } from "express";
import { validateData } from "../middlewares/validation-middleware";
import { payForLessonSchema } from "../schemas/transaction-schemas";
import { authGuard } from "../middlewares/auth-guard";
import TransactionService from "../services/transaction-service";
import { HttpError } from "http-errors";
import { StatusCodes } from "http-status-codes";

const accountService = new TransactionService();

const transactionRouter = express.Router();

transactionRouter.post(
  "/payment",
  validateData(payForLessonSchema),
  authGuard,
  async (req: Request, res: Response) => {
    const studentId = (
      req as Request & {
        student: { _id: string };
      }
    ).student._id;

    const studentLesson = await accountService
      .payForLesson(studentId, req.body)
      .catch((error: HttpError) => {
        res.status(error.statusCode).json(error.message);
      });
    res.status(StatusCodes.CREATED).json(studentLesson);
  }
);

transactionRouter.get(
  "/statistic",
  authGuard,
  async (req: Request, res: Response) => {
    const studentId = (
      req as Request & {
        student: { _id: string };
      }
    ).student._id;

    const studentLesson = await accountService
      .getReferralStatistic(studentId)
      .catch((error: HttpError) => {
        res.status(error.statusCode).json(error.message);
      });
    res.status(StatusCodes.CREATED).json(studentLesson);
  }
);

export default transactionRouter;

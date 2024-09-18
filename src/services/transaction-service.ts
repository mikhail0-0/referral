import {
  ACCOUNTS_TABLE_NAME,
  LESSONS_TABLE_NAME,
  REFERRAL_PERCENT,
  REFERRAL_TRANSACTIONS_TABLE_NAME,
  STUDENT_LESSONS_TABLE_NAME,
  STUDENTS_TABLE_NAME,
  TRANSACTIONS_TABLE_NAME,
} from "../config/constants";
import db from "../database/db";
import { StatusCodes } from "http-status-codes";
import { TStudent } from "./student-service";
import createHttpError from "http-errors";
import { PayLessonDTO } from "../dtos/dtos";
import { Body, Get, Post, Request, Route, Security, Tags } from "tsoa";

export type TAccount = {
  id: string;
  student_id: string;
};

export type TLesson = {
  id: string;
  name: string;
  cost: string;
};

export type TStudentLesson = {
  id: string;
  student_id: string;
  lesson_id: string;
  transaction_id: string;
};

export type TTransaction = {
  id: string;
  account_from_id: string;
  account_to_id: string;
  amount: string;
};

export type TReferralTransaction = {
  id: string;
  referrer_id: string;
  referral_id: string;
  transaction_id: string;
};

export type TStatistic = {
  referral_id: string;
  amount: string;
};

@Tags("Transactions")
@Route("/transactions")
export default class TransactionService {
  @Security("jwt")
  @Post("/payment")
  async payForLesson(
    @Request() studentId: string,
    @Body() dto: PayLessonDTO
  ): Promise<TStudentLesson> {
    const lessonId = dto.lesson_id;

    const [student]: TStudent[] = await db(STUDENTS_TABLE_NAME)
      .select("*")
      .from(STUDENTS_TABLE_NAME)
      .orWhere({ id: studentId })
      .returning("*");

    if (!student) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "wrong student data");
    }

    const accounts: TAccount[] = await db
      .select("*")
      .from(ACCOUNTS_TABLE_NAME)
      .where({ student_id: null })
      .orWhere({ student_id: studentId })
      .orWhere(
        student.referrer_id ? { student_id: student.referrer_id } : false
      )
      .returning("*");

    const systemAccount = accounts.find(
      ({ student_id }) => student_id === null
    );

    if (!systemAccount) {
      throw createHttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "internal server error"
      );
    }

    const studentAccount = accounts.find(
      ({ student_id }) => student_id === studentId
    );

    if (!studentAccount) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "wrong student data");
    }

    if (!lessonId) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "wrong lesson data");
    }

    const [boughtLesson]: TStudentLesson[] = await db
      .select("*")
      .from(STUDENT_LESSONS_TABLE_NAME)
      .where({
        lesson_id: lessonId,
        student_id: student.id,
      })
      .returning("*");
    if (boughtLesson) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "lesson already bought");
    }

    const [lesson]: TLesson[] = await db
      .select("*")
      .from(LESSONS_TABLE_NAME)
      .where({ id: lessonId })
      .returning("*");
    if (!lesson) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "wrong lesson data");
    }

    const saveTransactionData: Omit<TTransaction, "id">[] = [
      {
        account_from_id: studentAccount.id,
        account_to_id: systemAccount.id,
        amount: lesson.cost,
      },
    ];

    if (student.referrer_id) {
      const referrerAccount = accounts.find(
        ({ student_id }) => student_id === student.referrer_id
      );

      if (!referrerAccount) {
        throw createHttpError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "internal server error"
        );
      }

      saveTransactionData.push({
        account_from_id: systemAccount.id,
        account_to_id: referrerAccount.id,
        amount: (Math.floor(+lesson.cost / 100) * REFERRAL_PERCENT).toString(),
      });
    }

    const trx = await db.transaction();

    let studentLesson: TStudentLesson | undefined = undefined;
    try {
      const transactions: TTransaction[] = await trx(TRANSACTIONS_TABLE_NAME)
        .insert(saveTransactionData)
        .returning("*");

      const payTransaction = transactions.find(
        ({ account_to_id }) => account_to_id === systemAccount.id
      );
      if (!payTransaction) {
        throw createHttpError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "internal server error"
        );
      }

      const saveStudentLessonData: Omit<TStudentLesson, "id"> = {
        student_id: student.id,
        transaction_id: payTransaction.id,
        lesson_id: lesson.id,
      };

      [studentLesson] = await trx(STUDENT_LESSONS_TABLE_NAME)
        .insert(saveStudentLessonData)
        .returning("*");

      if (student.referrer_id) {
        const referrerTransaction = transactions.find(
          ({ account_from_id }) => account_from_id === systemAccount.id
        );
        if (!referrerTransaction) {
          throw createHttpError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "internal server error"
          );
        }

        const saveReferralTransactionData: Omit<TReferralTransaction, "id"> = {
          referral_id: student.id,
          referrer_id: student.referrer_id,
          transaction_id: referrerTransaction.id,
        };

        await trx(REFERRAL_TRANSACTIONS_TABLE_NAME)
          .insert(saveReferralTransactionData)
          .returning("*");
      }
    } catch (error) {
      trx.rollback();
      throw createHttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "internal server error"
      );
    }
    await trx.commit();

    if (!studentLesson) {
      throw createHttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "internal server error"
      );
    }
    return studentLesson;
  }

  @Security("jwt")
  @Get("/statistic")
  async getReferralStatistic(
    @Request() studentId: string
  ): Promise<TStatistic[]> {
    const referralTransactions = await db
      .select("*")
      .from(REFERRAL_TRANSACTIONS_TABLE_NAME)
      .innerJoin(
        TRANSACTIONS_TABLE_NAME,
        `${REFERRAL_TRANSACTIONS_TABLE_NAME}.transaction_id`,
        `${TRANSACTIONS_TABLE_NAME}.id`
      )
      .where({ referrer_id: studentId })
      .returning("*");

    const statistic = referralTransactions.map(({ referral_id, amount }) => ({
      referral_id,
      amount,
    }));
    return statistic;
  }
}

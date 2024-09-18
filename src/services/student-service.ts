import db from "../database/db";
import {
  ACCOUNTS_TABLE_NAME,
  SALT_ROUNDS,
  STUDENTS_TABLE_NAME,
} from "../config/constants";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Config } from "../config/config";
import { Post, Route, Body, Get, Request, Security, Tags } from "tsoa";
import { AuthStudentDTO, RegStudentDTO } from "../dtos/dtos";
import createHttpError from "http-errors";
import { Request as ExpressRequest } from "express";

export type TStudent = RegStudentDTO & {
  id: string;
};

type TTokenPayload = {
  _id: string;
  name: string;
};

@Tags('Students')
@Route("/students")
export default class StudentService {
  @Post()
  public async registerStudent(@Body() dto: RegStudentDTO): Promise<TStudent> {
    const referrerId =
      dto.referrer_id && dto.referrer_id !== "null" ? dto.referrer_id : null;
    const existStudents: TStudent[] = await db
      .select("*")
      .from(STUDENTS_TABLE_NAME)
      .where({ email: dto.email })
      .orWhere({ phone_number: dto.phone_number })
      .orWhere(referrerId ? { id: referrerId } : false)
      .returning("id");

    if (referrerId) {
      const referrer = existStudents.find(({ id }) => id === referrerId);
      if (!referrer) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "bad referrer data");
      }
    }

    const errors: string[] = [];

    const existWithEmail = existStudents.find(
      ({ email }) => email === dto.email
    );
    if (existWithEmail) {
      errors.push("email already registred");
    }

    const existWithPhone = existStudents.find(
      ({ phone_number }) => phone_number === dto.phone_number
    );
    if (existWithPhone) {
      errors.push("phone number already registred");
    }

    if (errors.length) {
      throw createHttpError(StatusCodes.BAD_REQUEST, errors.join(", "));
    }

    const createStudentData: RegStudentDTO = {
      ...dto,
      referrer_id: referrerId,
      password: bcrypt.hashSync(dto.password, SALT_ROUNDS),
    };

    const trx = await db.transaction();

    let newStudent: TStudent;
    try {
      [newStudent] = await trx(STUDENTS_TABLE_NAME)
        .insert(createStudentData)
        .returning("*");

      if (!newStudent) throw Error();

      await trx(ACCOUNTS_TABLE_NAME).insert({ student_id: newStudent.id });
    } catch (error) {
      trx.rollback();
      throw createHttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "internal server error"
      );
    }
    await trx.commit();

    return newStudent;
  }

  @Post("/auth")
  async authorizeStudent(@Body() dto: AuthStudentDTO) {
    const [studentsUser]: TStudent[] = await db
      .select("*")
      .from(STUDENTS_TABLE_NAME)
      .where({ email: dto.phone_or_email })
      .orWhere({ phone_number: dto.phone_or_email })
      .returning("*");

    if (!studentsUser) {
      throw createHttpError(
        StatusCodes.BAD_REQUEST,
        "user with this email or phone not registered"
      );
    }

    const verify = await bcrypt.compare(dto.password, studentsUser.password);
    if (!verify) {
      throw createHttpError(
        StatusCodes.BAD_REQUEST,
        "user with this email or phone not registered"
      );
    }

    const payload: TTokenPayload = {
      _id: studentsUser.id,
      name: studentsUser.name,
    };
    const token = jwt.sign(payload, Config.secretKey, {
      expiresIn: `${Config.jwtExpiresIn} seconds`,
    });

    return { ...payload, token };
  }

  @Security("jwt")
  @Get("/referral")
  genReferralLink(@Request() req: ExpressRequest): { link: string } {
    const refererId = (req as ExpressRequest & { student: { _id: string } })
      .student._id;

    const host = req.get("Host");
    if (!host) {
      throw createHttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "internal server error"
      );
    }
    const protocol = req.protocol;

    const url = new URL(`${protocol}://${host}/students/register`);
    url.searchParams.append("referrerId", refererId);
    return { link: url.toString() };
  }
}

import { z } from "zod";
import { AuthStudentDTO, RegStudentDTO } from "../dtos/dtos";

const studentRegObj: Record<keyof RegStudentDTO, any> = {
  name: z.string().min(3).max(100),
  phone_number: z.string().regex(new RegExp(/^(\+7+([0-9]){10})$/)),
  email: z.string().email().max(100),
  password: z.string().min(3).max(100),
  referrer_id: z.string().max(100).nullable(),
};

export const studentRegSchema = z.object(studentRegObj).strict();

const studentAuthObj: Record<keyof AuthStudentDTO, any> = {
  phone_or_email: studentRegObj.phone_number.or(studentRegObj.email),
  password: studentRegObj.password,
};
export const studentAuthSchema = z.object(studentAuthObj).strict();

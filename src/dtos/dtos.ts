export class RegStudentDTO {
  name!: string;
  phone_number!: string;
  email!: string;
  password!: string;
  referrer_id!: string | null;
}

export class AuthStudentDTO {
  phone_or_email!: string;
  password!: string;
}

export class PayLessonDTO {
  lesson_id!: string;
}

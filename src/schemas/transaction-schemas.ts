import { z } from "zod";

const zodObj = {
  lesson_id: z.string().max(100),
};

export const payForLessonSchema = z.object(zodObj).strict();

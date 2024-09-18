import type { Knex } from "knex";
import { LESSONS_TABLE_NAME } from "../../config/constants";

export async function up(knex: Knex): Promise<void> {
  await knex
    .insert([
      { name: "testLesson1", cost: 10000 },
      { name: "testLesson2", cost: 20000 },
      { name: "testLesson3", cost: 30000 },
      { name: "testLesson4", cost: 40000 },
    ])
    .into(LESSONS_TABLE_NAME);
}

export async function down(): Promise<void> {}

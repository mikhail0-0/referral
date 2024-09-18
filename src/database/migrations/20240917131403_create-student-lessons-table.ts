import type { Knex } from "knex";
import { STUDENT_LESSONS_TABLE_NAME } from "../../config/constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable(STUDENT_LESSONS_TABLE_NAME, (table: Knex.TableBuilder) => {
      table
        .uuid("id", { primaryKey: true })
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.uuid("student_id").notNullable();
      table.foreign("student_id").references("students.id");
      table.uuid("lesson_id").notNullable();
      table.foreign("lesson_id").references("lessons.id");
      table.uuid("transaction_id").notNullable();
      table.foreign("transaction_id").references("transactions.id");
    });
}

export async function down(): Promise<void> {}

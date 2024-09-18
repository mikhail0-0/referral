import type { Knex } from "knex";
import { ACCOUNTS_TABLE_NAME } from "../../config/constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable(ACCOUNTS_TABLE_NAME, (table: Knex.TableBuilder) => {
      table
        .uuid("id", { primaryKey: true })
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.uuid("student_id");
      table.foreign("student_id").references("students.id");
    });
}

export async function down(): Promise<void> {}

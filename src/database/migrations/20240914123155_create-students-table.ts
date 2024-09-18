import type { Knex } from "knex";
import { STUDENTS_TABLE_NAME } from "../../config/constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable(STUDENTS_TABLE_NAME, (table: Knex.TableBuilder) => {
      table
        .uuid("id", { primaryKey: true })
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.string("name").notNullable();
      table.string("phone_number").notNullable().unique();
      table.string("email").notNullable().unique();
      table.string("password").notNullable();
      table.uuid("referrer_id");
      table.foreign("referrer_id").references("id");
    });
}

export async function down(): Promise<void> {}

import type { Knex } from "knex";
import { LESSONS_TABLE_NAME } from "../../config/constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable(LESSONS_TABLE_NAME, (table: Knex.TableBuilder) => {
      table
        .uuid("id", { primaryKey: true })
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.string("name").unique().notNullable();
      table.bigint("cost").notNullable();
    });
}

export async function down(): Promise<void> {}

import type { Knex } from "knex";
import { TRANSACTIONS_TABLE_NAME } from "../../config/constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable(TRANSACTIONS_TABLE_NAME, (table: Knex.TableBuilder) => {
      table
        .uuid("id", { primaryKey: true })
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.uuid("account_from_id").notNullable();
      table.foreign("account_from_id").references("accounts.id");
      table.uuid("account_to_id").notNullable();
      table.foreign("account_to_id").references("accounts.id");
      table.bigint("amount").notNullable();
    });
}

export async function down(): Promise<void> {}

import type { Knex } from "knex";
import { REFERRAL_TRANSACTIONS_TABLE_NAME } from "../../config/constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable(
      REFERRAL_TRANSACTIONS_TABLE_NAME,
      (table: Knex.TableBuilder) => {
        table
          .uuid("id", { primaryKey: true })
          .defaultTo(knex.raw("uuid_generate_v4()"));
        table.uuid("referrer_id").notNullable();
        table.foreign("referrer_id").references("students.id");
        table.uuid("referral_id").notNullable();
        table.foreign("referral_id").references("students.id");
        table.uuid("transaction_id").notNullable();
        table.foreign("transaction_id").references("transactions.id");
      }
    );
}

export async function down(): Promise<void> {}

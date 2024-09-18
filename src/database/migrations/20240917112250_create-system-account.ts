import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.insert({}).into("accounts").returning("id");
}

export async function down(): Promise<void> {}

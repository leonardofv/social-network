import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.withSchema('public').createTable('users', (table) => {
    table.increments();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('username').unique().notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.withSchema('public').dropTable('users');
}

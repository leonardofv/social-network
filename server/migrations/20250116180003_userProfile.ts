import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .withSchema('public')
    .createTable('user_profile', (table) => {
      table
        .integer('user_id')
        .references('id')
        .inTable('users')
        .primary()
        .onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('profile_picture');
      table.string('bio');
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.withSchema('public').dropTable('user_profile');
}

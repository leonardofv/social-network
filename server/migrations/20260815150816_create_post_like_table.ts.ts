import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').createTable('post_like', (table) => {
        table.integer('post_id').references('id').inTable('post').notNullable().onDelete('CASCADE');
        table.integer('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE');
        table.dateTime('like_date').defaultTo(knex.fn.now());
        table.unique(['post_id', 'user_id']);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('post_like');
}


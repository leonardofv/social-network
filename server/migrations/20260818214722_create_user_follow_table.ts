import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').createTable('user_follow', (table) => {
        table.integer('follower_id').references('id').inTable('users').notNullable().onDelete('CASCADE');
        table.integer('followed_id').references('id').inTable('users').notNullable().onDelete('CASCADE');
        table.dateTime('follow_date').defaultTo(knex.fn.now());
        table.unique(['follower_id', 'followed_id']);
        table.check('?? <> ??', ['follower_id', 'followed_id'], 'user_follow_no_self_follow');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('user_follow');
}


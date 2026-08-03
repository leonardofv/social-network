import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').alterTable('post_comment', (table) => {
        table.index('post_id', 'post_comment_post_id_index');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').alterTable('post_comment', (table) => {
        table.dropIndex('post_id', 'post_comment_post_id_index');
    });
}


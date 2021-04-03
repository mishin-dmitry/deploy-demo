exports.up = function (knex) {
  return knex.schema.createTable("tokens", (table) => {
    table.increments("id");
    table.integer("user_id").notNullable();
    table.foreign("user_id").references("users.id");
    table.string("token").notNullable().unique();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tokens");
};

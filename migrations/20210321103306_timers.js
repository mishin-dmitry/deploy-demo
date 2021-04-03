exports.up = function (knex) {
  return knex.schema.createTable("timers", (table) => {
    table.increments("id");
    table.integer("user_id");
    table.foreign("user_id").references("users.id");
    table.boolean("is_active");
    table.string("description", 255);
    table.bigInteger("start").notNullable();
    table.bigInteger("end");
    table.integer("duration");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("timers");
};

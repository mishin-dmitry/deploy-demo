require("dotenv").config();

const { nanoid } = require("nanoid");
const { client, connection } = require("./knexfile");

const knex = require("knex")({ client, connection });

const deleteToken = async (token) => {
  await knex("tokens").where({ token }).delete();
};

const findUserByName = async (username) => {
  return knex("users")
    .where({ username })
    .limit(1)
    .then((result) => result[0]);
};

const getUserById = async (userId) => {
  return knex("users")
    .where({ id: userId })
    .limit(1)
    .then((result) => result[0]);
};

const findUserByToken = async (token) => {
  const searchedToken = await knex("tokens")
    .select("user_id")
    .where({ token })
    .limit(1)
    .then((result) => result[0]);

  return searchedToken && getUserById(searchedToken.user_id);
};

const createToken = async (userId) => {
  const token = nanoid();

  await knex("tokens").insert({
    user_id: userId,
    token,
  });

  return token;
};

const createUser = async ({ username, password }) => {
  const [id] = await knex("users")
    .insert({ username, password })
    .returning("id");

  return id;
};

const addTimer = async (userId, description) => {
  const [id] = await knex("timers")
    .insert({
      user_id: userId,
      is_active: true,
      description,
      start: Date.now(),
    })
    .returning("id");

  return id;
};

const getTimers = async (userId, isActive) => {
  const timers = await knex("timers").where({
    user_id: userId,
    is_active: isActive,
  });

  return timers.map((timer) => ({
    id: timer.id,
    isActive: timer.is_active,
    description: timer.description,
    start: +timer.start,
    end: +timer.end,
    duration: timer.duration,
    progress: isActive ? Date.now() - timer.start : null,
  }));
};

const stopTimer = async (userId, timerId) => {
  const { start } = await knex("timers")
    .where({ user_id: userId, id: timerId })
    .then((result) => result[0]);

  await knex("timers")
    .where({ user_id: userId, id: timerId })
    .update({
      is_active: false,
      end: Date.now(),
      duration: Date.now() - start,
    });
};

const findTimer = async (userId, timerId) => {
  return knex("timers")
    .where({ user_id: userId, id: timerId })
    .then((result) => result[0]);
};

module.exports = {
  deleteToken,
  findUserByName,
  findUserByToken,
  createUser,
  addTimer,
  getTimers,
  stopTimer,
  findTimer,
  createToken,
};

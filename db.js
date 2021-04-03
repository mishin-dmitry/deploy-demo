require("dotenv").config();
const { nanoid } = require("nanoid");
const { client, connection } = require("./knexfile");

const knex = require("knex")({ client, connection });

const deleteSession = async (sessionId) => {
  await knex("sessions").where({ session_id: sessionId }).delete();
};

const findUserByName = async (username) => {
  return await knex("users")
    .where({ username })
    .limit(1)
    .then((result) => result[0]);
};

const getUserById = async (userId) => {
  return await knex("users")
    .where({ id: userId })
    .limit(1)
    .then((result) => result[0]);
};

const findUserBySessionId = async (sessionId) => {
  const session = await knex("sessions")
    .select("user_id")
    .where({ session_id: sessionId })
    .limit(1)
    .then((result) => result[0]);

  return session && getUserById(session.user_id);
};

const createSession = async (userId) => {
  const sessionId = nanoid();

  await knex("sessions").insert({
    user_id: userId,
    session_id: sessionId,
  });

  return sessionId;
};

const createUser = async ({ username, password }) => {
  const [id] = await knex("users").insert({ username, password }).returning("id");

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
  const timers = await knex("timers").where({ user_id: userId, is_active: isActive });

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
  deleteSession,
  findUserByName,
  findUserBySessionId,
  createSession,
  createUser,
  addTimer,
  getTimers,
  stopTimer,
  findTimer,
};

const { stopTimer, addTimer, getTimers } = require("./db");

async function sendAllTimersMessage(userId, ws) {
  try {
    const activeTimers = await getTimers(userId, true);
    const oldTimers = await getTimers(userId, false);

    const allTimersMessage = JSON.stringify({
      type: "all_timers",
      message: { activeTimers, oldTimers },
    });

    ws.send(allTimersMessage);
  } catch (e) {
    return;
  }
}

async function sendActiveTimersMessage(userId, ws) {
  try {
    const activeTimers = await getTimers(userId, true);

    const activeTimersMessage = JSON.stringify({
      type: "active_timers",
      message: { activeTimers },
    });

    ws.send(activeTimersMessage);
  } catch (e) {
    return;
  }
}

const addTimerHandle = async (description, userId, ws) => {
  try {
    const id = await addTimer(userId, description ?? "");

    await sendAllTimersMessage(userId, ws);

    const successMessage = JSON.stringify({
      type: "timer_created_success",
      id,
      description,
    });

    ws.send(successMessage);
  } catch (e) {
    const errorMessage = JSON.stringify({
      type: "timer_created_error",
      error: "Error adding new timer",
    });
    ws.send(errorMessage);
  }
};

const stopTimerHandle = async (userId, timerId, ws) => {
  try {
    await stopTimer(userId, timerId);

    await sendAllTimersMessage(userId, ws);

    const successMessage = JSON.stringify({
      type: "timer_stopped_success",
      id: timerId,
    });

    ws.send(successMessage);
  } catch (e) {
    const errorMessage = JSON.stringify({
      type: "timer_stopped_error",
      error: "Error stopping timer",
    });
    ws.send(errorMessage);
  }
};

module.exports = {
  addTimerHandle,
  stopTimerHandle,
  sendAllTimersMessage,
  sendActiveTimersMessage,
};

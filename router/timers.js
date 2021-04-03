const express = require("express");
const bodyParser = require("body-parser");
const auth = require("../middlewares/auth");
const { checkUserWithSendStatus } = require("../middlewares/checkUser");
const { getTimers, stopTimer, findTimer, addTimer } = require("../db");

const router = express.Router();
const jsonParser = bodyParser.json();

router.post("/:id/stop", auth, checkUserWithSendStatus(), jsonParser, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const timer = await findTimer(userId, id);

    if (!timer) {
      return res.status(404).send(`Unknown timer with id ${id}`);
    }

    if (!timer.is_active) {
      return res.status(400).send("Timer already stopped");
    }

    await stopTimer(userId, id);

    res.sendStatus(204);
  } catch (err) {
    res.status(500).send("Error stopping timer");
  }
});

router.get("/", auth, checkUserWithSendStatus(), async (req, res) => {
  const { isActive } = req.query;
  const userId = req.user?.id;

  if (isActive === undefined) {
    return res.status(400).send("Invalid parameter value in the request");
  }

  try {
    const searchedTimers = await getTimers(userId, isActive);
    res.json(searchedTimers);
  } catch (e) {
    res.status(500).send("Error getting timers");
  }
});

router.post("/", auth, checkUserWithSendStatus(), jsonParser, async (req, res) => {
  const description = req.body?.description ?? "";
  const userId = req.user?.id;

  try {
    const id = await addTimer(userId, description ?? "");

    res.status(201).send({ id });
  } catch (e) {
    res.status(500).send("Error adding new timer");
  }
});

module.exports = router;

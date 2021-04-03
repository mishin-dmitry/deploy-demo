/*global UIkit, Vue */

(() => {
  const notification = (config) =>
    UIkit.notification({
      pos: "top-right",
      timeout: 5000,
      ...config,
    });

  const alert = (message) =>
    notification({
      message,
      status: "danger",
    });

  const info = (message) =>
    notification({
      message,
      status: "success",
    });

  new Vue({
    el: "#app",
    data: {
      desc: "",
      activeTimers: [],
      oldTimers: [],
      client: null,
    },
    methods: {
      createTimer() {
        const description = this.desc;
        this.desc = "";

        const addTimerMessage = JSON.stringify({
          type: "create_timer",
          description,
        });

        this.client.send(addTimerMessage);
      },
      createTimerSuccess(description = "", id = "") {
        info(`Created new timer "${description}" [${id}]`);
      },
      createTimerError(error) {
        alert(error);
      },
      stopTimer(id) {
        const stopTimerMessage = JSON.stringify({
          type: "stop_timer",
          id,
        });

        this.client.send(stopTimerMessage);
      },
      stopTimerSuccess(id) {
        info(`Stopped the timer [${id}]`);
      },
      stopTimerError(error) {
        alert(error);
      },
      formatTime(ts) {
        return new Date(ts).toTimeString().split(" ")[0];
      },
      formatDuration(d) {
        d = Math.floor(d / 1000);
        const s = d % 60;
        d = Math.floor(d / 60);
        const m = d % 60;
        const h = Math.floor(d / 60);
        return [h > 0 ? h : null, m, s]
          .filter((x) => x !== null)
          .map((x) => (x < 10 ? "0" : "") + x)
          .join(":");
      },
      activeTimersHandle(timers) {
        const { activeTimers } = timers;

        this.activeTimers = activeTimers;
      },
      allTimersHandle(timers) {
        const { activeTimers, oldTimers } = timers;

        this.activeTimers = activeTimers;
        this.oldTimers = oldTimers;
      },
    },
    created() {
      const wsProtocol = location.protocol === "https" ? "wss:" : "ws:";
      this.client = new WebSocket(`${wsProtocol}//${location.host}`);

      this.client.addEventListener("message", (message) => {
        let data;
        try {
          data = JSON.parse(message.data);
        } catch (e) {
          return;
        }

        switch (data.type) {
          case "all_timers":
            return this.allTimersHandle(data.message);
          case "active_timers":
            return this.activeTimersHandle(data.message);
          case "timer_stopped_success":
            return this.stopTimerSuccess(data.id);
          case "timer_stopped_error":
            return this.stopTimerError(data.error);
          case "timer_created_success":
            return this.createTimerSuccess(data.description, data.id);
          case "timer_created_error":
            return this.createTimerError(data.error);
        }
      });
    },
  });
})();

const express = require("express");
const nunjucks = require("nunjucks");
const cookieParser = require("cookie-parser");

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});

app.set("view engine", "njk");

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.use("/", require("./router/index"));
app.use("/api/timers", require("./router/timers"));

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});

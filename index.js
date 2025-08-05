const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const exphbs = require("express-handlebars");
const redis = require("redis");

// Create Redis Client
let client = redis.createClient();

client.on("connect", () => {
  console.log("Redis connected");
});
client.on("error", (err) => {
  console.error("Redis error:", err);
});

const port = 5000;

// Init app
const app = express();

//View Engine
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Method Override used for PUT and DELETE requests bcause HTML forms only supports GET and POST
app.use(methodOverride("_method"));

// Serve static files
app.use("/static", express.static(__dirname + "/views/layouts"));

//Search Page
app.get("/", (req, res, next) => {
  res.render("searchusers");
});

// Search Processin
app.post("/users/search", (req, res, next) => {
  const id = req.body.id;
});

app.listen(port, () => {
  console.log("Server started on port " + port);
});

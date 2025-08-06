const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const exphbs = require("express-handlebars");
const redis = require("redis");

// Create Redis Client
let client = redis.createClient();

client
  .connect()
  .then(() => {
    console.log("Redis connected");
  })
  .catch((err) => {
    console.error("Redis connection error:", err);
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
app.post("/user/search", async (req, res, next) => {
  const id = req.body.id;
  try {
    const obj = await client.hGetAll(id);
    console.log({ obj });
    if (!obj || Object.keys(obj).length === 0) {
      res.render("searchusers", {
        error: "User does not exist",
      });
    } else {
      obj.id = id;
      res.render("details", {
        user: obj,
      });
    }
  } catch (error) {
    res.render("searchusers", {
      error: "Error fetching user data",
    });
  }
});

// Add user Page
app.get("/user/add", async (req, res, next) => {
  res.render("adduser");
});
app.post("/user/add", async (req, res, next) => {
  let newUser = req.body;
  console.log({ newUser });
  // Ensure all fields are present and not undefined
  if (
    !newUser.id ||
    !newUser.first_name ||
    !newUser.last_name ||
    !newUser.email ||
    !newUser.phone
  ) {
    return res.render("adduser", {
      error: "All fields are required.....",
      ...newUser,
    });
  }
  try {
    const reply = await client.hSet(
      newUser.id,
      "first_name",
      newUser.first_name,
      "last_name",
      newUser.last_name,
      "email",
      newUser.email,
      "phone",
      newUser.phone
    );

    console.log("reply: ", reply);
    res.redirect("/");
  } catch (error) {
    res.render("adduser", {
      error: "Error...",
      error,
      ...newUser, // This spreads back the input values to keep them filled
    });
  }
});

app.listen(port, () => {
  console.log("Server started on port " + port);
});

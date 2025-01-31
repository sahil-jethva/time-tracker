import jsonServer from "json-server";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
server.use(bodyParser.json());

server.use(middlewares);
server.use(cors());
const SECRET_KEY = "your_secret_key";
const expiresIn = "1h";

function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied: No token provided." });
  }
  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (err) {
    res.status(401).json({ message: "Access denied: Invalid token." });
  }
}


// Authentication endpoints
server.post("/login", (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ "message": "Email and password is required to login!" });
  }
  const user = router.db.get("users").find({ email, password }).value();

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = createToken({ id: user.id, email: user.email });
  res.status(200).json({ token, user });
});

server.post("/register", (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password;
  const name = req.body.name?.trim();

  if (!email || !password || !name) {
    return res.status(400).json({ "message": "Email, name and password is required to register!" });
  }

  const existingUser = router.db.get("users").find({ email }).value();

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = { id: Date.now(), email, password, name };
  router.db.get("users").push(newUser).write();

  const token = createToken({ id: newUser.id, email: newUser.email });
  res.status(201).json({ token, user: newUser });
});

// Protect all /groups routes
server.use("/clients", verifyToken);
server.use("/projects", verifyToken);
server.use("/tasks", verifyToken);
server.use("/logs", verifyToken);
server.post("/addProjects",  (req, res) => {
  const p_name = req.body.p_name
  const c_id = req.body.c_id
  try {
    const client = router.db.get("client").find({ id: c_id }).value()
    if (!client) {
      return res.status(404).json({message:"No client found"})
    }
      const newProject = { id:Date.now(), p_name,c_id }
      router.db.get("projects").push(newProject).write()
      res.status(201).json({ projects: newProject });

  } catch (err) {
    res.status(500).json({ message: "Error fetching client details", error: err.message });
  }
})

server.post("/addTasks", (req, res) => {
  const t_name = req.body.t_name
  const p_id = req.body.p_id
  try {
    const projects = router.db.get("projects").find({ id: p_id }).value()
    if (!projects) {
      return res.status(404).json({ message: "No projects found" })
    }
    const newProject = { id: Date.now(), t_name, p_id }
    router.db.get("tasks").push(newProject).write()
    res.status(201).json({ projects: newProject });

  } catch (err) {
    res.status(500).json({ message: "Error fetching client details", error: err.message });
  }
})
server.get("/me", verifyToken, (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = router.db.get("users").find({ id: decoded.id }).value();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user details", error: err.message });
  }
});
server.get("/logs/getData", verifyToken, (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { u_id, client_name, project_name, from_date, to_date } = req.query;

  if (!u_id || !client_name || !project_name || !from_date || !to_date) {
    return res.status(400).json({
      message: "u_id, client_name, project_name, from_date, and to_date are required",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.id !== parseInt(u_id)) {
      return res.status(403).json({ message: "Access denied: Unauthorized user." });
    }

    const fromDate = new Date(from_date);
    const toDate = new Date(to_date);

    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const logs = router.db
      .get("logs")
      .filter(log =>
        log.u_id === parseInt(u_id) &&
        typeof log.c_name === "string" &&
        log.c_name.toLowerCase() === client_name.toLowerCase() &&
        typeof log.p_name === "string" &&
        log.p_name.toLowerCase() === project_name.toLowerCase() &&
        new Date(log.date) >= fromDate &&
        new Date(log.date) <= toDate
      )
      .value();

    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching logs", error: err.message });
  }
});
server.get("/logs/getAllLogs", verifyToken, (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { u_id, from_date, to_date } = req.query;

  if (!u_id || !from_date || !to_date) {
    return res.status(400).json({
      message: "u_id, from_date, and to_date are required",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.id !== parseInt(u_id)) {
      return res.status(403).json({ message: "Access denied: Unauthorized user." });
    }

    const fromDate = new Date(from_date);
    const toDate = new Date(to_date);

    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const logs = router.db
      .get("logs")
      .filter(log =>
        log.u_id === parseInt(u_id) &&
        new Date(log.date) >= fromDate &&
        new Date(log.date) <= toDate
      )
      .value();

    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching logs", error: err.message });
  }
});

server.get("/logs/getByDate", verifyToken, (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { u_id, date } = req.query;

  if (!u_id || !date) {
    return res.status(400).json({
      message: "u_id and date are required",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.id !== parseInt(u_id)) {
      return res.status(403).json({ message: "Access denied: Unauthorized user." });
    }

    const formattedDate = new Date(date);
    if (isNaN(formattedDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const logs = router.db
      .get("logs")
      .filter(log =>
        log.u_id === parseInt(u_id) &&
        log.date === date // Compare directly with the query param
      )
      .value();


    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: "No logs found for the given date" });
    }

    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching logs", error: err.message });
  }
});


// Use JSON Server's router
server.use(router);

// Start the server
server.listen(3000, () => {
  console.log("JSON Server is running on http://localhost:3000");
});

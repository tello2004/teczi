import finalhandler from "finalhandler";
import http from "http";
import Router from "router";
import bodyParser from "body-parser";
import { pool, init } from "./database.js";

const router = Router();

router.use(bodyParser.json());

router.post("/api/alumnos", async (req, res) => {
  try {
    const { nombre, email, curso } = req.body;

    if (!nombre || !email || !curso) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(
        JSON.stringify({ error: "Todos los campos son requeridos" }),
      );
    }

    if (![1, 2, 3].includes(parseInt(curso))) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Curso no válido" }));
    }

    const result = await pool.query(
      "INSERT INTO alumnos (nombre, email, curso) VALUES ($1, $2, $3) RETURNING id",
      [nombre, email, parseInt(curso)],
    );

    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        mensaje: "Alumno registrado exitosamente",
        id: result.rows[0].id,
      }),
    );
  } catch (error) {
    console.error("Error al registrar alumno:", error);

    if (error.code === "23505") {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "El email ya está registrado" }));
    }

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Error interno del servidor" }));
  }
});

router.get("/api/cursos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cursos ORDER BY id");

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result.rows));
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Error interno del servidor" }));
  }
});

router.post("/api/cursos", async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(
        JSON.stringify({ error: "El nombre del curso es requerido" }),
      );
    }

    const result = await pool.query(
      "INSERT INTO cursos (nombre) VALUES ($1) RETURNING id",
      [nombre],
    );

    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        mensaje: "Curso creado exitosamente",
        id: result.rows[0].id,
      }),
    );
  } catch (error) {
    console.error("Error al crear curso:", error);

    // Manejo de nombre duplicado
    if (error.code === "23505") {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(
        JSON.stringify({ error: "Ya existe un curso con ese nombre" }),
      );
    }

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Error interno del servidor" }));
  }
});

await init();

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  router(req, res, finalhandler(req, res));
});

server.listen(5000, () => {
  console.log("Servidor iniciado en el puerto 5000");
});

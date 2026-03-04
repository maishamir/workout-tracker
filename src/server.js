// import express from "express";
// import cors from "cors";
// import { mockExercises, mockRoutines, mockSessions } from "./mockData.js";

// const app = express();
// app.use(cors({ origin: "http://localhost:5173" }));
// app.use(express.json());

// // ── Exercises ──────────────────────────────────────────────
// app.get("/exercises", (req, res) => {
//   res.json(mockExercises);
// });

// app.get("/exercises/:id", (req, res) => {
//   const exercise = mockExercises.find((e) => e.id === Number(req.params.id));
//   if (!exercise) return res.status(404).json({ error: "Exercise not found" });
//   res.json(exercise);
// });

// // ── Routines ───────────────────────────────────────────────
// app.get("/routines", (req, res) => {
//   res.json(mockRoutines);
// });

// app.get("/routines/:id", (req, res) => {
//   const routine = mockRoutines.find((r) => r.id === Number(req.params.id));
//   if (!routine) return res.status(404).json({ error: "Routine not found" });
//   res.json(routine);
// });

// // ── Sessions ───────────────────────────────────────────────
// app.get("/sessions", (req, res) => {
//   res.json(mockSessions);
// });

// app.get("/sessions/:id", (req, res) => {
//   const session = mockSessions.find((s) => s.id === Number(req.params.id));
//   if (!session) return res.status(404).json({ error: "Session not found" });
//   res.json(session);
// });

// // Sessions by routine
// app.get("/routines/:id/sessions", (req, res) => {
//   const sessions = mockSessions.filter(
//     (s) => s.routineId === Number(req.params.id),
//   );
//   res.json(sessions);
// });

// // Mock POST - just echoes back a fake created session
// app.post("/routines/:id/sessions", (req, res) => {
//   const routineId = Number(req.params.id);
//   const routine = mockRoutines.find((r) => r.id === routineId);
//   if (!routine) return res.status(404).json({ error: "Routine not found" });

//   const { date } = req.body ?? {};
//   const sessionDate = date ? new Date(date) : new Date();

//   const newSession = {
//     id: Date.now(),
//     routineId,
//     routineNameSnapshot: routine.name,
//     date: sessionDate.toISOString(),
//     completed: false,
//     sessionExercises: [],
//   };

//   res.status(201).json(newSession);
// });

// app.listen(3000, () => console.log("Mock server running on port 3000"));

import express from "express";
import cors from "cors";
import exerciseRouter from "./routes/exercises.js";
import routinesRouter from "./routes/routines.js";
import sessionsRouter from "./routes/sessions.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

app.use("/exercises", exerciseRouter);
app.use("/routines", routinesRouter);
app.use("/sessions", sessionsRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

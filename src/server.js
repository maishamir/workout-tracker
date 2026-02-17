import express from "express";
import cors from "cors";
import exerciseRouter from "./routes/exercises.js";
import routinesRouter from "./routes/routines.js";
import sessionsRouter from "./routes/sessions.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());

app.use("/exercises", exerciseRouter);
app.use("/routines", routinesRouter);
app.use("/sessions", sessionsRouter);

app.listen(3000, () => {
    console.log("Server running on port 3000")
})
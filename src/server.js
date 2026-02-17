import express from "express";
import cors from "cors";
import exerciseRouter from "./routes/exercises.js";
import routinesRouter from "./routes/routines.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/exercises", exerciseRouter);
app.use("/routines", routinesRouter)

app.listen(3000, () => {
    console.log("Server running on port 3000")
})
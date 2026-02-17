import express from "express";
import { prisma } from "../db/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const exercises = await prisma.exercise.findMany({
            orderBy: { name: "asc" },
        });

        res.json(exercises);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch exercises" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, primaryMuscleGroup, equipment, type, isCustom } = req.body;

        // validation
        if (!name || !primaryMuscleGroup || !equipment || !type) {
            return res.status(400).json({
                error: "name, primaryMuscleGroup, equipment, and type are required",
            });
        }

        const newExercise = await prisma.exercise.create({
            data: {
                name, primaryMuscleGroup, equipment, type, isCustom: isCustom ?? true,
            },
        });

        res.status(201).json(newExercise);
    }

    catch (error) {
        console.error(error);

        //throw error if error code indicates duplicate entry
        if (error.code === "P2002") {
            return res.status(409).json({
                error: "Exercise with this name already exists",
            });
        }

        res.status(500).json({ error: "Failed to create exercise" });
    }
})

export default router;
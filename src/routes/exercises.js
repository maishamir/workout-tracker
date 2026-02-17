import express from "express";
import { prisma } from "../db/prisma.js";

const router = express.Router();

// route to get all exercises
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

// route to add workout to db
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


// route to get specific exercise
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid exercise id" });
        }

        const exercise = await prisma.exercise.findUnique({ where: { id } });

        if (!exercise) {
            return res.status(404).json({ error: "Exercise not found" });
        }

        res.json(exercise);
    } catch (error) {
        console.error(error);

        res.status(500).json({ error: "Failed to fetch exercise" })
    }
});


// route to handle editing exercises
router.patch("/:id", async (req, res) => {
    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid exercise id" });
        }

        const { name, primaryMuscleGroup, equipment, type, isCustom, isActive } = req.body;

        // Build update object dynamically - patch means partial update, so overwrite fields when they have data, not with undefined
        const updateData = {};

        if (name != undefined) updateData.name = name;
        if (primaryMuscleGroup != undefined) updateData.primaryMuscleGroup = primaryMuscleGroup;
        if (equipment != undefined) updateData.equipment = equipment;
        if (type != undefined) updateData.type = type;
        if (isCustom != undefined) updateData.isCustom = isCustom;
        if (isActive != undefined) updateData.isActive = isActive;

        // update the data 
        const updatedExercise = await prisma.exercise.update({
            where: { id },
            data: updateData
        });

        res.json(updatedExercise);

    } catch (error) {
        console.error(error);

        if (error.code === "P2025") {
            return res.status(404).json({ error: "Exercise not found" });
        }

        if (error.code === "P2002") {
            return res.status(409).json({ error: "Exercise with this name already exists" });
        }

        res.status(500).json({ error: "Failed to update exercise" });
    }
})

// allow user to "delete" the exercise
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid exercise id" });
        }

        const deletedExercise = await prisma.exercise.update({
            where: { id },
            data: { isActive: false },
        })

        res.json({
            message: "Exercise deactivated successfully",
            exercise: deletedExercise
        })
    }

    catch (error) {
        console.error(error);

        if (error.code === "P2025") {
            return res.status(404), json({ error: "Exercise not found" });
        }

        res.status(500).json({ error: "Failed to delete exercise" });
    }
})

export default router;
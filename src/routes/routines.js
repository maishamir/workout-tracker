import express from "express";
import { prisma } from "../db/prisma.js";

const router = express.Router();


// route to create a routine
router.post("/", async (req, res) => {
    try {
        const { name, tags } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Routine name is required" });
        }

        const routine = await prisma.routine.create({
            data: {
                name,
                tags: tags ?? [],
            }
        });

        res.status(201).json(routine);
    }

    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create routine" });
    }
})

// TODO: ROUTE TO GET ALL ROUTINES
router.get("/", async (req, res) => {
    try {
        const routines = await prisma.routine.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(routines);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch routines" })
    }
})

// TODO: ROUTE TO GET SPECIFIC ROUTINE
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid routine id" });
        }

        const routine = await prisma.routine.findUnique({
            where: { id },
        });

        if (!routine) {
            return res.status(404).json({ error: "Routine not found" });
        }
        res.json(routine);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch routines" })
    }
})
// TODO: ROUTE TO EDIT A ROUTINE
router.patch("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid routine id" });
        }

        const { name, tags } = req.body;

        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (tags !== undefined) updateData.tags = tags;

        const updatedRoutine = await prisma.routine.update({
            where: { id },
            data: updateData,
        });

        res.json(updatedRoutine);

    } catch (error) {
        console.error(error);

        if (error.code === "P2025") {
            return res.status(404).json({ error: "Routine not found" });
        }

        res.status(500).json({ error: "Failed to update routine" });
    }
});

// TODO: ROUTE TO DELETE A ROUTINE
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid routine id" });
        }

        await prisma.routine.delete({
            where: { id },
        });

        res.json({ message: "Routine deleted successfully" });

    } catch (error) {
        console.error(error);

        if (error.code === "P2025") {
            return res.status(404).json({ error: "Routine not found" });
        }

        res.status(500).json({ error: "Failed to delete routine" });
    }
});


// TODO: ROUTE TO ADD EXERCISE TO ROUTINE
router.post("/:id/exercises", async (req, res) => {
    try {
        const routineId = Number(req.params.id);

        if (!Number.isInteger(routineId)) {
            return res.status(400).json({ error: "Invalid routine id" });
        }

        const { exerciseId, sectionLabel, orderIndex } = req.body;

        if (!exerciseId || sectionLabel === undefined || orderIndex === undefined) {
            return res.status(400).json({
                error: "exerciseId, sectionLabel, and orderIndex are required",
            });
        }

        const routineExercise = await prisma.routineExercise.create({
            data: {
                routineId,
                exerciseId,
                sectionLabel,
                orderIndex,
            },
        });

        res.status(201).json(routineExercise);
    } catch (error) {
        console.error(error);

        if (error.code === "P2003") {
            return res.status(400).json({
                error: "Invalid routineId or exerciseId",
            });
        }

        res.status(500).json({ error: "Failed to add exercise to routine" });
    }
})


export default router;
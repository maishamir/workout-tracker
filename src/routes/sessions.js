import express from "express";
import { prisma } from "../db/prisma.js";

const router = express.Router();

// TODO: GET ALL SESSIONS
router.get("/", async (req, res) => {
    try {
        const sessions = await prisma.workoutSession.findMany({
            orderBy: { date: "asc" },
            include: {
                sessionExercises: {
                    orderBy: [
                        { sectionLabel: "asc" },
                        { orderIndex: "asc" }
                    ],
                    include: {
                        exercise: true,
                        sessionSets: {
                            orderBy: { orderIndex: "asc" }
                        }
                    }
                }
            }
        });

        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch workout sessions" });
    }
});


// TODO: GET SPECIFIC SESSION BY ID
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid session id" });
        }

        const session = await prisma.workoutSession.findUnique({
            where: { id },
            include: {
                sessionExercises: {
                    orderBy: [
                        { sectionLabel: "asc" },
                        { orderIndex: "asc" }
                    ],
                    include: {
                        exercise: true,
                        sessionSets: {
                            orderBy: { orderIndex: "asc" }
                        }
                    }
                }
            }
        })

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        res.json(session);

    } catch (error) {
        console.error(error);
    }
});


router.patch("/sets/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid session set id" });
        }

        const { actualReps, actualWeight } = req.body;

        const updateData = {};

        if (actualReps !== undefined) updateData.actualReps = actualReps;
        if (actualWeight !== undefined) updateData.actualWeight = actualWeight;

        const updatedSet = await prisma.sessionSet.update({
            where: { id },
            data: updateData
        })

        res.json(updatedSet);

    } catch (error) {
        console.error(error);

        if (error.code = "P2025") {
            return res.status(404).json({ error: "Session set not found" });
        }

        res.status(500).json({ error: "Failed to update session set" });
    }
});

// TODO: MARK SESSION AS COMPLETE
router.patch("/:id/complete", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid session id" });
        }

        const updatedSession = await prisma.workoutSession.update({
            where: { id },
            data: {
                completed: true,
            }
        })

        res.json(updatedSession);

    } catch (error) {
        console.error(error);

        if (error.code === "P2025") {
            return res.status(404).json({ error: "Session not found" });
        }

        res.status(500).json({ error: "Failed to complete session" });
    }
});

// TODO: DELETE A SESSION - HARD 
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid session id" });
        }

        await prisma.workoutSession.delete({
            where: { id },
        })

        res.json({ message: "Workout session deleted successfully" });
    } catch (error) {
        console.error(error);

        if (error.code === "P2025") {
            return res.status(404).json({ error: "Session not found" });
        }

        res.status(500).json({ error: "Failed to delete workout session" });


    }
});


export default router;


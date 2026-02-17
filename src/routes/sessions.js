import express from "express";
import { prisma } from "../db/prisma.js";

const router = express.Router();

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

// router.patch("/:id", async (req, res));

// router.patch("/:id/complete", async (req, res));

// router.delete("/:id", async (req, res));


export default router;


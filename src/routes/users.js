import express from "express";
import { prisma } from "../db/prisma.js";

const router = express.Router();

// users.js
// TODO: POST /users - sync user from Clerk (create if not exists)
router.post('/', async (req, res) => {

    try {
        const { id, email, firstName, lastName, birthday } = req.body;

        if (!id) {
            return res.status(400).json({ error: "id is required" })
        }
        if (!firstName) {
            return res.status(400).json({ error: "First name is required" })
        }

        const user = await prisma.user.upsert({
            where: { id: id },
            update: {
                email,
                firstName,
                lastName,
                birthday
            },
            create: {
                id,
                email,
                firstName,
                lastName,
                birthday
            }
        })

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create user" })
    }
})
// TODO: GET /users/:id - fetch user by Clerk ID (optional for now)

// routines.js
// TODO: GET /routines - get ALL routines for the signed-in user
router.get('/routines', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        const userRoutines = await prisma.routine.findMany({
            orderBy: { name: "asc" },
            where: {
                userId: userId
            },
            include: {
                routineExercises: {
                    include: {
                        exercise: true,
                        routineSets: true
                    }
                }
            }
        })
        res.json(userRoutines)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch user's routines" })
    }


})
// TODO: PUT /routines/:id - update routine (already exists?)
// TODO: DELETE /routines/:id - delete routine (already exists?)

// workoutSessions.js (or sessions.js)
// TODO: GET /sessions - get all sessions for the signed-in user (filtered by userId)
router.get("/sessions", async (req, res) => {

    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" })
        }

        const userWorkoutSessions = await prisma.workoutSession.findMany({
            orderBy: { date: "asc" },
            where: { userId: userId },
            include: {
                sessionExercises: {
                    orderBy: [{ sessionLabel: "asc" }, { orderIndex: "asc" }],
                    include: {
                        exercise: true,
                        sessionSets: {
                            orderBy: { orderIndex: "asc" }
                        }
                    }
                }
            }
        })
        res.json(userWorkoutSessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch user's workout sessions" });
    }

});
// TODO: PUT /sessions/:id - mark session complete
// TODO: DELETE /sessions/:id - remove session

export default router;
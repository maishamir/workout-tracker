import express from "express";
import { prisma } from "../db/prisma.js";

const router = express.Router();

// users.js
// TODO: POST /users - sync user from Clerk (create if not exists)
router.post('/', async (req, res) => {
    console.log(req.body);

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
// TODO: PUT /routines/:id - update routine (already exists?)
// TODO: DELETE /routines/:id - delete routine (already exists?)

// workoutSessions.js (or sessions.js)
// TODO: GET /sessions - get all sessions for the signed-in user (filtered by userId)
// TODO: PUT /sessions/:id - mark session complete
// TODO: DELETE /sessions/:id - remove session

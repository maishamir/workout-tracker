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


// TODO: ROUTE TO GET SPECIFIC ROUTINE
// TODO: ROUTE TO EDIT A ROUTINE
// TODO: ROUTE TO DELETE A ROUTINE
export default router;
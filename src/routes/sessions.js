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
          orderBy: [{ sectionLabel: "asc" }, { orderIndex: "asc" }],
          include: {
            exercise: true,
            sessionSets: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch workout sessions" });
  }
});


// calculate streak
router.get("/streak", async (req, res) => {
  try {
    const sessions = await prisma.workoutSession.findMany({
      where: { scheduledDate: { not: null }, completed: true },
      select: {
        scheduledDate: true,
      },
      orderBy: { scheduledDate: "desc" },
    });

    if (sessions.length === 0) return res.json({ streak: 0 });

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sessions.length; i++) {
      let sessionDate = new Date(sessions[i].scheduledDate);
      sessionDate.setHours(0, 0, 0, 0);

      let daysDiff = (currentDate - sessionDate) / (1000 * 60 * 60 * 24);

      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    res.json({ streak })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch scheduled sessions" });
  }
});

router.get("/scheduled", async (req, res) => {
  try {
    const sessions = await prisma.workoutSession.findMany({
      where: { scheduledDate: { not: null } },
      select: {
        id: true,
        scheduledDate: true,
        completed: true,
        routineNameSnapshot: true,
      },
      orderBy: { scheduledDate: "asc" },
    });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch scheduled sessions" });
  }
});

router.get("/today", async (req, res) => {
  try {
    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const sessions = await prisma.workoutSession.findMany({
      where: {
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },

      select: {
        id: true,
        scheduledDate: true,
        completed: true,
        routineNameSnapshot: true,
        sessionExercises: {
          orderBy: [{ sectionLabel: "asc" }, { orderIndex: "asc" }],
          include: {
            exercise: true,
            sessionSets: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch today's sessions" });
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
          orderBy: [{ sectionLabel: "asc" }, { orderIndex: "asc" }],
          include: {
            exercise: true,
            sessionSets: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

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
      data: updateData,
    });

    res.json(updatedSet);
  } catch (error) {
    console.error(error);

    if ((error.code = "P2025")) {
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
      },
    });

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
    });

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

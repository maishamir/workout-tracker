import express from "express";
import { prisma } from "../db/prisma.js";

const router = express.Router();

// route to create a routine
router.post("/", async (req, res) => {
  console.log(req.body);

  try {
    const { userId, name, tags, routineExercises } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Routine name is required" });
    }

    const routine = await prisma.routine.create({
      data: {
        userId,
        name,
        tags: tags ?? [],
        routineExercises: {
          create: routineExercises,
        },
      },
    });

    res.status(201).json(routine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create routine" });
  }
});

// ROUTE TO GET ALL ROUTINES
router.get("/", async (req, res) => {
  try {
    const routines = await prisma.routine.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        routineExercises: {
          include: {
            exercise: true,
            routineSets: true,
          },
        },
      },
    });
    res.json(routines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch routines" });
  }
});

// ROUTE TO GET SPECIFIC ROUTINE
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid routine id" });
    }

    const routine = await prisma.routine.findUnique({
      where: { id },
      include: {
        routineExercises: {
          orderBy: [{ sectionLabel: "asc" }, { orderIndex: "asc" }],
          include: {
            exercise: true,
            routineSets: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    if (!routine) {
      return res.status(404).json({ error: "Routine not found" });
    }
    res.json(routine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch routines" });
  }
});
// ROUTE TO EDIT A ROUTINE
router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid routine id" });
    }

    const { name, tags, routineExercises } = req.body;
    // console.log(name)

    const updatedRoutine = await prisma.$transaction(async (tx) => {
      // step 1: delete all existing exercises (cascades to routineSets)
      await tx.routineExercise.deleteMany({
        where: { routineId: id },
      });

      // step 2: update the routine exericses
      return await tx.routine.update({
        where: { id },
        data: {
          name,
          tags: tags ?? [],
          routineExercises: {
            create: routineExercises,
          },
        },
      });
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

// ROUTE TO DELETE A ROUTINE
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

    res.status(500).json({ error: "Failed to delete routine", message: error });
  }
});

// ROUTE TO ADD EXERCISE TO ROUTINE
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
});

// SET THE NUMBER OF TARGET REPS PER SET
router.post("/routine-exercises/:id/sets", async (req, res) => {
  try {
    const routineExerciseId = Number(req.params.id);

    if (!Number.isInteger(routineExerciseId)) {
      return res.status(400).json({ error: "Invalid routineExercise id" });
    }

    const { orderIndex, targetMinReps, targetMaxReps, targetExactReps } =
      req.body;

    if (orderIndex === undefined) {
      return res.status(400).json({
        error: "orderIndex is required",
      });
    }

    const set = await prisma.routineSet.create({
      data: {
        routineExerciseId,
        orderIndex,
        targetMinReps,
        targetMaxReps,
        targetExactReps,
      },
    });

    res.status(201).json(set);
  } catch (error) {
    console.error(error);

    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Invalid routineExerciseId",
      });
    }

    res.status(500).json({ error: "Failed to create routine set" });
  }
});

// CREATE WORKOUT SESSION FROM ROUTINE
router.post("/:id/sessions", async (req, res) => {
  try {
    const routineId = Number(req.params.id);

    if (!Number.isInteger(routineId)) {
      return res.status(400).json({ error: "Invalid routine id" });
    }

    const { date, scheduledDate } = req.body ?? {};
    const sessionDate = date ? new Date(date) : new Date();
    const sessionScheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    console.log(sessionDate, sessionScheduledDate);


    const createdSession = await prisma.$transaction(async (tx) => {
      // fetch routine with full nested structure
      const routine = await tx.routine.findUnique({
        where: { id: routineId },
        include: {
          routineExercises: {
            orderBy: [{ sectionLabel: "asc" }, { orderIndex: "asc" }],
            include: {
              routineSets: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      });

      if (!routine) {
        return res.status(404).json({ error: "Routine not found" });
      }

      // transform routineExercies to sessionExercises (copy)
      const sessionExercisesData = routine.routineExercises.map((re) => ({
        exerciseId: re.exerciseId,
        sectionLabel: re.sectionLabel,
        orderIndex: re.orderIndex,
        sessionSets: {
          create: re.routineSets.map((rs) => ({
            orderIndex: rs.orderIndex,
            targetMinReps: rs.targetMinReps,
            targetMaxReps: rs.targetMaxReps,
            targetExactReps: rs.targetExactReps,
            actualReps: null,
            actualWeight: null,
          })),
        },
      }));

      // create workoutsession + nested children in one atomic write
      // atomic -> either it happens in one go or not at all
      const session = await tx.workoutSession.create({
        data: {
          routineId: routine.id,
          routineNameSnapshot: routine.name,
          date: sessionDate,
          scheduledDate: sessionScheduledDate,
          completed: false,
          sessionExercises: {
            create: sessionExercisesData,
          },
        },
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

      return session;
    });

    res.status(201).json(createdSession);
  } catch (error) {
    console.error(error);

    if (error.status === 404) {
      return res.status(404).json({ error: "Routine not found" });
    }

    res.status(500).json({ error: "Failed to create workout session" });
  }
});

// ROUTE TO DELETE EXERCISE FROM ROUTINE
router.delete("/:id/exercises/:routineExerciseId/", async (req, res) => {
  try {
    const routineId = Number(req.params.id);
    const exerciseId = Number(req.params.exerciseId);

    if (!Number.isInteger(routineId) || !Number.isInteger(exerciseId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    await prisma.routineExercise.delete({
      where: {
        id: routineExerciseId,
      },
    });

    res.json({ message: "Exercise removed from routine successfully" });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Exercise not found in routine" });
    }

    res.status(500).json({ error: "Failed to remove exercise from routine" });
  }
});

export default router;

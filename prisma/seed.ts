import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
    adapter,
});


// make call to exerciseDB
async function fetchAllExercises() {
    const baseURL = "https://oss.exercisedb.dev/api/v1/exercises";
    let after = null;
    let allExercises = [];
    let hasNextPage = true;

    while (hasNextPage) {
        const url = after ? `${baseURL}?after=${after}` : baseURL;

        // await new Promise(resolve => setTimeout(resolve, 500));

        const response = await fetch(url);

        if (response.status === 429) {
            const retryAfter = Number(response.headers.get("retry-after"));

            await new Promise(resolve => {
                setTimeout(resolve, retryAfter * 1000)
            })

            continue;
        }

        if (!response.ok) {
            console.log(response.headers);

            throw new Error(`API ERROR: ${response.headers}`)
        }

        const body = await response.json();
        console.log(body);

        allExercises = allExercises.concat(body.data);
        hasNextPage = body.meta.hasNextPage;
        after = body.meta.nextCursor ?? null;

    }

    return allExercises;


}


const exercises = [
    {
        name: "Barbell Back Squat",
        primaryMuscleGroup: "QUADS",
        equipment: "BARBELL",
        type: "STRENGTH",
        isCustom: false,
        isActive: true,
    },
    {
        name: "Barbell Bench Press",
        primaryMuscleGroup: "CHEST",
        equipment: "BARBELL",
        type: "STRENGTH",
        isCustom: false,
        isActive: true,
    },
    {
        name: "Deadlift",
        primaryMuscleGroup: "BACK",
        equipment: "BARBELL",
        type: "STRENGTH",
        isCustom: false,
        isActive: true,
    },
    {
        name: "Lat Pulldown",
        primaryMuscleGroup: "BACK",
        equipment: "MACHINE",
        type: "STRENGTH",
        isCustom: false,
        isActive: true,
    },
    {
        name: "Dumbbell Shoulder Press",
        primaryMuscleGroup: "SHOULDERS",
        equipment: "DUMBBELL",
        type: "STRENGTH",
        isCustom: false,
        isActive: true,
    },
    {
        name: "Treadmill Jog",
        primaryMuscleGroup: "TOTAL_BODY",
        equipment: "MACHINE",
        type: "CARDIO",
        isCustom: false,
        isActive: true,
    },
];

async function main() {
    const fetchedExercises = await fetchAllExercises();


    let transformedExercises = fetchedExercises.map(ex => {
        return {
            name: ex.name,
            primaryMuscleGroup: ex.targetMuscles[0]?.toUpperCase(),
            equipment: ex.equipments[0]?.toUpperCase(),
            type: 'STRENGTH' as const,
            isCustom: false,
            isActive: true
        }
    })


    for (const ex of transformedExercises) {
        await prisma.exercise.upsert({
            where: { name: ex.name }, // name must be UNIQUE in your schema
            update: {
                primaryMuscleGroup: ex.primaryMuscleGroup,
                equipment: ex.equipment,
                type: ex.type,
                isCustom: ex.isCustom,
                isActive: true,
            },
            create: ex,
        });
    }


}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

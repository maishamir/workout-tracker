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
    for (const ex of exercises) {
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

    const count = await prisma.exercise.count();
    console.log(`✅ Seed complete. Exercise count: ${count}`);
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

-- DropForeignKey
ALTER TABLE "WorkoutSession" DROP CONSTRAINT "WorkoutSession_routineId_fkey";

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

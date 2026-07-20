/*
  Warnings:

  - Changed the type of `primaryMuscleGroup` on the `Exercise` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `equipment` on the `Exercise` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "primaryMuscleGroup",
ADD COLUMN     "primaryMuscleGroup" TEXT NOT NULL,
DROP COLUMN "equipment",
ADD COLUMN     "equipment" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "weeklyGoal",
ADD COLUMN     "activeWeekdays" INTEGER[] NOT NULL DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6]::INTEGER[];

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "completedAt" TIMESTAMP(3);

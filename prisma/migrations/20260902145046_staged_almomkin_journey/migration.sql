-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'FREE_TEXT', 'SCALE');

-- CreateEnum
CREATE TYPE "QuestionStage" AS ENUM ('INITIAL_DECISION', 'JUSTIFICATION', 'INITIAL_CONFIDENCE', 'ALMOMKIN_ANALYSIS', 'FINAL_DECISION', 'FINAL_CONFIDENCE', 'ALMOMKIN_HELPED');

-- DropForeignKey
ALTER TABLE "responses" DROP CONSTRAINT "responses_answerOptionId_fkey";

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "stage" "QuestionStage" NOT NULL DEFAULT 'INITIAL_DECISION',
ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE';

-- AlterTable
ALTER TABLE "responses" ADD COLUMN     "responseText" TEXT,
ALTER COLUMN "answerOptionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "study_cases" ADD COLUMN     "newInformation" TEXT;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_answerOptionId_fkey" FOREIGN KEY ("answerOptionId") REFERENCES "answer_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

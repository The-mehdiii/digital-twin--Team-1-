-- CreateEnum
CREATE TYPE "PersonalityTrait" AS ENUM ('NEUTRAL', 'FRIENDLY', 'PROFESSIONAL', 'HUMOROUS', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "ResponseStyle" AS ENUM ('CONCISE', 'BALANCED', 'DETAILED');

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "customPrompt" TEXT,
ADD COLUMN     "personality" "PersonalityTrait" NOT NULL DEFAULT 'NEUTRAL',
ADD COLUMN     "responseStyle" "ResponseStyle" NOT NULL DEFAULT 'BALANCED';

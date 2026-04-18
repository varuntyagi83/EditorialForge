/*
  Warnings:

  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('INDIAN_FESTIVAL', 'ABSURDIST_WESTERN', 'PREMIUM_LIFESTYLE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductIntegration" AS ENUM ('HELD', 'PLACED', 'CONSUMED', 'CENTRAL', 'ABSENT');

-- CreateEnum
CREATE TYPE "BriefStatus" AS ENUM ('DRAFT', 'GENERATING', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SceneStatus" AS ENUM ('PENDING', 'GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "FeedbackTargetType" AS ENUM ('SCENE', 'COMPOSITION');

-- CreateEnum
CREATE TYPE "FeedbackVerdict" AS ENUM ('LOVE', 'GOOD', 'MEH', 'REJECT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "email" SET NOT NULL;

-- CreateTable
CREATE TABLE "Brief" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "culturalContextId" TEXT,
    "category" "Category" NOT NULL,
    "protagonistArchetype" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "productFamily" TEXT,
    "productIntegration" "ProductIntegration" NOT NULL,
    "headline" TEXT NOT NULL,
    "subhead" TEXT,
    "cta" TEXT,
    "notes" TEXT,
    "status" "BriefStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "promptExpanded" TEXT NOT NULL,
    "negativePrompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "seed" BIGINT,
    "gcsPath" TEXT,
    "gcsUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "aspectRatio" TEXT NOT NULL,
    "status" "SceneStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Composition" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "layoutTemplateId" TEXT NOT NULL,
    "headlineText" TEXT NOT NULL,
    "subheadText" TEXT,
    "ctaText" TEXT,
    "logoAssetId" TEXT,
    "gcsPath" TEXT NOT NULL,
    "gcsUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Composition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayoutTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "headlineZone" JSONB NOT NULL,
    "subheadZone" JSONB,
    "ctaZone" JSONB,
    "logoZone" JSONB,
    "typography" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LayoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CulturalContext" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "visualAnchors" JSONB NOT NULL,
    "fabricAndColor" JSONB NOT NULL,
    "typicalProtagonists" JSONB NOT NULL,
    "atmosphericSignatures" JSONB NOT NULL,
    "forbiddenCombinations" JSONB NOT NULL,
    "referenceImageUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CulturalContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceImage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "culturalContextId" TEXT,
    "gcsPath" TEXT NOT NULL,
    "gcsUrl" TEXT NOT NULL,
    "tags" TEXT[],
    "sourceUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferenceImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogoAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "gcsPath" TEXT NOT NULL,
    "gcsUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogoAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "FeedbackTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "verdict" "FeedbackVerdict" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sceneId" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Brief_createdAt_idx" ON "Brief"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Brief_userId_idx" ON "Brief"("userId");

-- CreateIndex
CREATE INDEX "Scene_briefId_idx" ON "Scene"("briefId");

-- CreateIndex
CREATE INDEX "Scene_createdAt_idx" ON "Scene"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Composition_sceneId_idx" ON "Composition"("sceneId");

-- CreateIndex
CREATE INDEX "ReferenceImage_culturalContextId_idx" ON "ReferenceImage"("culturalContextId");

-- CreateIndex
CREATE INDEX "ReferenceImage_userId_idx" ON "ReferenceImage"("userId");

-- CreateIndex
CREATE INDEX "LogoAsset_userId_idx" ON "LogoAsset"("userId");

-- CreateIndex
CREATE INDEX "Feedback_targetId_idx" ON "Feedback"("targetId");

-- AddForeignKey
ALTER TABLE "Brief" ADD CONSTRAINT "Brief_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brief" ADD CONSTRAINT "Brief_culturalContextId_fkey" FOREIGN KEY ("culturalContextId") REFERENCES "CulturalContext"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Composition" ADD CONSTRAINT "Composition_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Composition" ADD CONSTRAINT "Composition_layoutTemplateId_fkey" FOREIGN KEY ("layoutTemplateId") REFERENCES "LayoutTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Composition" ADD CONSTRAINT "Composition_logoAssetId_fkey" FOREIGN KEY ("logoAssetId") REFERENCES "LogoAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceImage" ADD CONSTRAINT "ReferenceImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceImage" ADD CONSTRAINT "ReferenceImage_culturalContextId_fkey" FOREIGN KEY ("culturalContextId") REFERENCES "CulturalContext"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogoAsset" ADD CONSTRAINT "LogoAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('live', 'paused');

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "SurveyStatus" NOT NULL DEFAULT 'paused',
    "surveyType" TEXT NOT NULL DEFAULT 'survey',
    "templateType" TEXT NOT NULL DEFAULT 'blank',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "document" JSONB NOT NULL,
    "documentVersion" INTEGER NOT NULL DEFAULT 1,
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "surveyName" TEXT NOT NULL,
    "surveyType" TEXT NOT NULL DEFAULT 'survey',
    "orderId" TEXT NOT NULL,
    "customerId" TEXT,
    "pageType" TEXT,
    "channelType" TEXT,
    "questions" JSONB NOT NULL,
    "meta" JSONB,
    "payload" JSONB,
    "shopSequence" INTEGER,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Survey_shop_status_idx" ON "Survey"("shop", "status");

-- CreateIndex
CREATE INDEX "Survey_shop_updatedAt_idx" ON "Survey"("shop", "updatedAt");

-- CreateIndex
CREATE INDEX "Survey_shop_name_idx" ON "Survey"("shop", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_shop_orderId_surveyId_key" ON "SurveyResponse"("shop", "orderId", "surveyId");

-- CreateIndex
CREATE INDEX "SurveyResponse_shop_submittedAt_idx" ON "SurveyResponse"("shop", "submittedAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_shop_surveyId_submittedAt_idx" ON "SurveyResponse"("shop", "surveyId", "submittedAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_shop_orderId_idx" ON "SurveyResponse"("shop", "orderId");

-- CreateIndex
CREATE INDEX "SurveyResponse_shop_customerId_idx" ON "SurveyResponse"("shop", "customerId");

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

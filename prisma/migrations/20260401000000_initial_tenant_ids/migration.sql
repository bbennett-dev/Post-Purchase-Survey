-- CreateTable
CREATE TABLE "Shop" (
    "id" BIGSERIAL NOT NULL,
    "shopUuid" UUID NOT NULL DEFAULT uuidv7(),
    "myshopifyDomain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

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
    "id" BIGSERIAL NOT NULL,
    "surveyUuid" UUID NOT NULL DEFAULT uuidv7(),
    "shopId" BIGINT NOT NULL,
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
    "id" BIGSERIAL NOT NULL,
    "responseUuid" UUID NOT NULL DEFAULT uuidv7(),
    "shopId" BIGINT NOT NULL,
    "surveyId" BIGINT NOT NULL,
    "surveyName" TEXT NOT NULL,
    "surveyType" TEXT NOT NULL DEFAULT 'survey',
    "orderId" TEXT NOT NULL,
    "customerId" TEXT,
    "email" TEXT,
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
CREATE UNIQUE INDEX "Shop_shopUuid_key" ON "Shop"("shopUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_myshopifyDomain_key" ON "Shop"("myshopifyDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Survey_surveyUuid_key" ON "Survey"("surveyUuid");

-- CreateIndex
CREATE INDEX "Survey_shopId_status_idx" ON "Survey"("shopId", "status");

-- CreateIndex
CREATE INDEX "Survey_shopId_updatedAt_idx" ON "Survey"("shopId", "updatedAt");

-- CreateIndex
CREATE INDEX "Survey_shopId_name_idx" ON "Survey"("shopId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_responseUuid_key" ON "SurveyResponse"("responseUuid");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_shopId_orderId_surveyId_key" ON "SurveyResponse"("shopId", "orderId", "surveyId");

-- CreateIndex
CREATE INDEX "SurveyResponse_shopId_submittedAt_idx" ON "SurveyResponse"("shopId", "submittedAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_shopId_surveyId_submittedAt_idx" ON "SurveyResponse"("shopId", "surveyId", "submittedAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_shopId_orderId_idx" ON "SurveyResponse"("shopId", "orderId");

-- CreateIndex
CREATE INDEX "SurveyResponse_shopId_customerId_idx" ON "SurveyResponse"("shopId", "customerId");

-- CreateIndex
CREATE INDEX "SurveyResponse_shopId_email_idx" ON "SurveyResponse"("shopId", "email");

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

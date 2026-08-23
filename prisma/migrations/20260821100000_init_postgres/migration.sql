-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

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

-- CreateTable
CREATE TABLE "SurveyConfig" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "heading" TEXT NOT NULL DEFAULT 'How did you hear about us?',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "allowOther" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyOption" (
    "id" TEXT NOT NULL,
    "surveyConfigId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isOther" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "shopifyOrderGid" TEXT NOT NULL,
    "shopifyOrderNumber" TEXT,
    "shopifyCustomerGid" TEXT,
    "checkoutToken" TEXT,
    "surveyConfigId" TEXT NOT NULL,
    "otherText" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponseSelection" (
    "id" TEXT NOT NULL,
    "surveyResponseId" TEXT NOT NULL,
    "surveyOptionId" TEXT,
    "optionLabel" TEXT NOT NULL,

    CONSTRAINT "SurveyResponseSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_shop_idx" ON "Session"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyConfig_shop_key" ON "SurveyConfig"("shop");

-- CreateIndex
CREATE INDEX "SurveyOption_surveyConfigId_position_idx" ON "SurveyOption"("surveyConfigId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyOption_surveyConfigId_label_key" ON "SurveyOption"("surveyConfigId", "label");

-- CreateIndex
CREATE INDEX "SurveyResponse_shop_createdAt_idx" ON "SurveyResponse"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_shop_shopifyCustomerGid_idx" ON "SurveyResponse"("shop", "shopifyCustomerGid");

-- CreateIndex
CREATE INDEX "SurveyResponse_surveyConfigId_idx" ON "SurveyResponse"("surveyConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_shop_shopifyOrderGid_key" ON "SurveyResponse"("shop", "shopifyOrderGid");

-- CreateIndex
CREATE INDEX "SurveyResponseSelection_surveyOptionId_idx" ON "SurveyResponseSelection"("surveyOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponseSelection_surveyResponseId_surveyOptionId_key" ON "SurveyResponseSelection"("surveyResponseId", "surveyOptionId");

-- AddForeignKey
ALTER TABLE "SurveyOption" ADD CONSTRAINT "SurveyOption_surveyConfigId_fkey" FOREIGN KEY ("surveyConfigId") REFERENCES "SurveyConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyConfigId_fkey" FOREIGN KEY ("surveyConfigId") REFERENCES "SurveyConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponseSelection" ADD CONSTRAINT "SurveyResponseSelection_surveyResponseId_fkey" FOREIGN KEY ("surveyResponseId") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponseSelection" ADD CONSTRAINT "SurveyResponseSelection_surveyOptionId_fkey" FOREIGN KEY ("surveyOptionId") REFERENCES "SurveyOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;


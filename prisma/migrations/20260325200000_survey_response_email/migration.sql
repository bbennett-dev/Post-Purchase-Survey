-- AlterTable
ALTER TABLE "SurveyResponse" ADD COLUMN "email" TEXT;

-- CreateIndex
CREATE INDEX "SurveyResponse_shop_email_idx" ON "SurveyResponse"("shop", "email");

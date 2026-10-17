-- Live/paused is authoritative on Survey.status; isActive duplicated document.isActive.
ALTER TABLE "Survey" DROP COLUMN "isActive";

-- Migration for mod-tasks module implementation
-- Target: PostgreSQL

BEGIN;

-- 1. Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT
);

-- 2. Update JobStatus Enum
-- We create a new type and migrate the column because Postgres doesn't support removing enum values easily.
CREATE TYPE "JobStatus_new" AS ENUM ('PENDING', 'RUNNING', 'FAILED', 'COMPLETED');
ALTER TABLE "ScheduledJob" ALTER COLUMN "status" TYPE "JobStatus_new" USING (
    CASE 
        WHEN "status"::text = 'ACTIVE' THEN 'PENDING'::"JobStatus_new"
        WHEN "status"::text = 'PAUSED' THEN 'PENDING'::"JobStatus_new"
        WHEN "status"::text = 'ERROR' THEN 'FAILED'::"JobStatus_new"
        ELSE 'PENDING'::"JobStatus_new"
    END
);
DROP TYPE "JobStatus";
ALTER TYPE "JobStatus_new" RENAME TO "JobStatus";

-- 3. Update AlertChannel Enum
CREATE TYPE "AlertChannel_new" AS ENUM ('EMAIL', 'WHATSAPP', 'PUSH', 'SLACK');
ALTER TABLE "Alert" ALTER COLUMN "channel" TYPE "AlertChannel_new" USING (
    CASE 
        WHEN "channel"::text = 'IN_APP' THEN 'PUSH'::"AlertChannel_new"
        ELSE "channel"::text::"AlertChannel_new"
    END
);
DROP TYPE "AlertChannel";
ALTER TYPE "AlertChannel_new" RENAME TO "AlertChannel";

-- 4. Update AlertStatus Enum
CREATE TYPE "AlertStatus_new" AS ENUM ('UNSENT', 'SENT', 'READ');
ALTER TABLE "Alert" ALTER COLUMN "status" TYPE "AlertStatus_new" USING (
    CASE 
        WHEN "status"::text = 'PENDING' THEN 'UNSENT'::"AlertStatus_new"
        WHEN "status"::text = 'FAILED' THEN 'UNSENT'::"AlertStatus_new"
        ELSE "status"::text::"AlertStatus_new"
    END
);
DROP TYPE "AlertStatus";
ALTER TYPE "AlertStatus_new" RENAME TO "AlertStatus";

-- 5. Add Foreign Keys
-- Note: We assume existing data in recipientId and ownerId are valid UUIDs.
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE;

-- 6. Ensure Indexes for Performance
CREATE INDEX IF NOT EXISTS "ScheduledJob_nextRun_idx" ON "ScheduledJob"("nextRun");
CREATE INDEX IF NOT EXISTS "Alert_recipientId_idx" ON "Alert"("recipientId");
CREATE INDEX IF NOT EXISTS "Alert_status_idx" ON "Alert"("status");

COMMIT;

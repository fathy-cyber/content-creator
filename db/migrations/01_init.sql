-- Migration: Initialize Automation Hub Schema
-- Target: PostgreSQL

-- Enums
CREATE TYPE "TriggerType" AS ENUM ('WEBHOOK', 'SCHEDULE', 'EVENT');
CREATE TYPE "ActionType" AS ENUM ('EMAIL', 'AI_GEN', 'API_CALL');
CREATE TYPE "IntegrationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR');
CREATE TYPE "ExecutionStatus" AS ENUM ('SUCCESS', 'FAILED', 'RUNNING');

-- Tables
CREATE TABLE "Workflow" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Trigger" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "type" "TriggerType" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "workflowId" UUID UNIQUE NOT NULL,
    CONSTRAINT "Trigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE
);

CREATE TABLE "Step" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "workflowId" UUID NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "nextStepId" UUID,
    "actionId" UUID,
    CONSTRAINT "Step_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE,
    CONSTRAINT "Step_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id"),
    CONSTRAINT "Step_nextStepId_fkey" FOREIGN KEY ("nextStepId") REFERENCES "Step"("id"),
    UNIQUE ("workflowId", "sequenceOrder")
);

CREATE TABLE "Action" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "type" "ActionType" NOT NULL,
    "integrationId" UUID,
    "templateId" UUID,
    CONSTRAINT "Action_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id"),
    CONSTRAINT "Action_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id")
);

CREATE TABLE "Integration" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "credentials" JSONB NOT NULL DEFAULT '{}',
    "status" "IntegrationStatus" NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE "Template" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '{}',
    "moduleOwner" TEXT NOT NULL
);

CREATE TABLE "ExecutionLog" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "workflowId" UUID NOT NULL,
    "status" "ExecutionStatus" NOT NULL,
    "startTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP WITH TIME ZONE,
    "errorLog" TEXT,
    CONSTRAINT "ExecutionLog_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE
);

-- Indexes
CREATE INDEX "Workflow_ownerId_idx" ON "Workflow"("ownerId");
CREATE INDEX "Trigger_workflowId_idx" ON "Trigger"("workflowId");
CREATE INDEX "Step_workflowId_idx" ON "Step"("workflowId");
CREATE INDEX "Action_integrationId_idx" ON "Action"("integrationId");
CREATE INDEX "Action_templateId_idx" ON "Action"("templateId");
CREATE INDEX "Integration_provider_idx" ON "Integration"("provider");
CREATE INDEX "Template_moduleOwner_idx" ON "Template"("moduleOwner");
CREATE INDEX "ExecutionLog_workflowId_idx" ON "ExecutionLog"("workflowId");
CREATE INDEX "ExecutionLog_status_idx" ON "ExecutionLog"("status");

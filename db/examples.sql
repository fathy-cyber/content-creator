-- Example Queries for Automation Hub

-- 1. Get a full workflow with its trigger and all steps in order
SELECT 
    w.name as workflow_name, 
    t.type as trigger_type, 
    t.config as trigger_config, 
    s.sequenceOrder, 
    s.actionType, 
    s.config as step_config,
    a.type as action_definition_type,
    i.provider as integration_provider,
    tmpl.name as template_name
FROM "Workflow" w
JOIN "Trigger" t ON w.id = t.workflowId
JOIN "Step" s ON w.id = s.workflowId
LEFT JOIN "Action" a ON s.actionId = a.id
LEFT JOIN "Integration" i ON a.integrationId = i.id
LEFT JOIN "Template" tmpl ON a.templateId = tmpl.id
WHERE w.id = 'your-workflow-uuid'
ORDER BY s.sequenceOrder ASC;

-- 2. Find all failed executions for a specific workflow in the last 24 hours
SELECT 
    id, 
    startTime, 
    endTime, 
    errorLog 
FROM "ExecutionLog" 
WHERE "workflowId" = 'your-workflow-uuid' 
  AND status = 'FAILED' 
  AND "startTime" > NOW() - INTERVAL '24 hours';

-- 3. Get all templates used by the 'marketing' module
SELECT 
    name, 
    content 
FROM "Template" 
WHERE "moduleOwner" = 'marketing';

-- 4. Check the status of all integrations for a specific provider
SELECT 
    id, 
    status 
FROM "Integration" 
WHERE "provider" = 'SendGrid';

-- 5. Insert a new workflow with a trigger and a first step
WITH new_workflow AS (
    INSERT INTO "Workflow" (name, description, "ownerId") 
    VALUES ('Welcome Sequence', 'Sends a welcome email to new leads', 'user-uuid') 
    RETURNING id
),
new_trigger AS (
    INSERT INTO "Trigger" (type, config, "workflowId") 
    SELECT 'WEBHOOK', '{"endpoint": "/webhooks/new-lead"}', id FROM new_workflow
)
INSERT INTO "Step" ("workflowId", "sequenceOrder", "actionType", config) 
SELECT id, 1, 'EMAIL', '{"subject": "Welcome!", "body": "Hi there!"}' FROM new_workflow;

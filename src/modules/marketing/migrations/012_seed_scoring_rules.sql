-- UP
-- Seed mock scoring rules and history for development/testing.
-- Uses subqueries to resolve org_id and lead_id from existing data so it
-- works regardless of actual UUID values.

DO $$
DECLARE
    v_org_id UUID;
    v_lead_id UUID;
    v_rule1_id UUID;
    v_rule2_id UUID;
    v_rule3_id UUID;
    v_rule4_id UUID;
    v_rule5_id UUID;
    v_rule6_id UUID;
    v_rule7_id UUID;
    v_rule8_id UUID;
BEGIN
    -- Resolve an existing org from the users table
    SELECT org_id INTO v_org_id FROM users WHERE org_id IS NOT NULL LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE NOTICE 'No org found — skipping seed. Run after at least one user has an org_id.';
        RETURN;
    END IF;

    -- Resolve an existing lead
    SELECT id INTO v_lead_id FROM marketing_leads LIMIT 1;

    -- ──────────────────────────────────────────────────────────────────────
    -- 1. Scoring Rules
    -- ──────────────────────────────────────────────────────────────────────

    INSERT INTO scoring_rules (org_id, name, field, operator, value, points, is_active, priority)
    VALUES (v_org_id, 'Referral Source — High Intent', 'source', 'equals', 'referral', 25, true, 1)
    RETURNING id INTO v_rule1_id;

    INSERT INTO scoring_rules (org_id, name, field, operator, value, points, is_active, priority)
    VALUES (v_org_id, 'Organic Source — Warm Traffic', 'source', 'equals', 'organic', 15, true, 2)
    RETURNING id INTO v_rule2_id;

    INSERT INTO scoring_rules (org_id, name, field, operator, value, points, is_active, priority)
    VALUES (v_org_id, 'Has Email — Reachable', 'email', 'exists', '', 10, true, 3)
    RETURNING id INTO v_rule3_id;

    INSERT INTO scoring_rules (org_id, name, field, operator, value, points, is_active, priority)
    VALUES (v_org_id, 'Has Phone — High Responsiveness', 'phone', 'exists', '', 15, true, 4)
    RETURNING id INTO v_rule4_id;

    INSERT INTO scoring_rules (org_id, name, field, operator, value, points, is_active, priority)
    VALUES (v_org_id, 'Has Company Name — B2B Qualified', 'metadata.company', 'exists', '', 20, true, 5)
    RETURNING id INTO v_rule5_id;

    INSERT INTO scoring_rules (org_id, name, field, operator, value, points, is_active, priority)
    VALUES (v_org_id, 'Engaged — Multiple Touchpoints', 'touchpoint_count', 'greater_than', '3', 20, true, 6)
    RETURNING id INTO v_rule6_id;

    INSERT INTO scoring_rules (org_id, name, field, operator, value, points, is_active, priority)
    VALUES (v_org_id, 'Agency Industry — Target Market', 'metadata.industry', 'contains', 'agency', 10, false, 7)
    RETURNING id INTO v_rule7_id;

    INSERT INTO scoring_rules (org_id, name, field, operator, value, points, is_active, priority)
    VALUES (v_org_id, 'No Email — Unreachable (Penalty)', 'email', 'not_exists', '', -20, true, 8)
    RETURNING id INTO v_rule8_id;

    -- ──────────────────────────────────────────────────────────────────────
    -- 2. Scoring History (only if a lead exists)
    -- ──────────────────────────────────────────────────────────────────────

    IF v_lead_id IS NOT NULL THEN
        INSERT INTO scoring_history (lead_id, rule_id, rule_name, points, reason)
        VALUES
            (v_lead_id, v_rule1_id, 'Referral Source — High Intent', 25, 'Lead source is referral — high purchase intent signal'),
            (v_lead_id, v_rule3_id, 'Has Email — Reachable', 10, 'Lead provided an email address'),
            (v_lead_id, v_rule4_id, 'Has Phone — High Responsiveness', 15, 'Lead provided a phone number'),
            (v_lead_id, v_rule5_id, 'Has Company Name — B2B Qualified', 20, 'Lead metadata includes company name');
    END IF;

    RAISE NOTICE 'Seeded % scoring rules + history for org %', 8, v_org_id;
END $$;

-- DOWN
DELETE FROM scoring_history;
DELETE FROM scoring_rules;

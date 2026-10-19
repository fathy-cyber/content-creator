-- UP
-- Seed mock marketing_leads and touchpoints for development/testing.
-- Each lead represents a distinct persona with different sources and engagement levels.

DO $$
DECLARE
    v_org_id UUID;
    v_lead1_id UUID;
    v_lead2_id UUID;
    v_lead3_id UUID;
    v_lead4_id UUID;
    v_lead5_id UUID;
    v_lead6_id UUID;
BEGIN
    -- Resolve org from existing users
    SELECT org_id INTO v_org_id FROM users WHERE org_id IS NOT NULL LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE NOTICE 'No org found — skipping lead seed.';
        RETURN;
    END IF;

    -- ──────────────────────────────────────────────────────────────────────
    -- 1. Marketing Leads (6 diverse profiles)
    -- ──────────────────────────────────────────────────────────────────────

    -- Lead 1: Hot referral lead from an agency owner
    INSERT INTO marketing_leads (org_id, email, name, phone, source, score, status, metadata)
    VALUES (
        v_org_id,
        'ahmed.benali@example.com',
        'Ahmed Ben Ali',
        '+216 50 123 456',
        'referral',
        50,
        'contacted',
        '{"company": "BenAli Digital", "industry": "Digital Agency", "companySize": "10-25", "budget": "5000"}'::jsonb
    )
    RETURNING id INTO v_lead1_id;

    -- Lead 2: Organic lead, SaaS founder, no phone
    INSERT INTO marketing_leads (org_id, email, name, phone, source, score, status, metadata)
    VALUES (
        v_org_id,
        'sarah.kthiri@example.com',
        'Sarah Kthiri',
        NULL,
        'organic',
        25,
        'new',
        '{"company": "Kthiri Tech", "industry": "SaaS", "companySize": "5-10"}'::jsonb
    )
    RETURNING id INTO v_lead2_id;

    -- Lead 3: High-value inbound, full contact info
    INSERT INTO marketing_leads (org_id, email, name, phone, source, score, status, metadata)
    VALUES (
        v_org_id,
        'mehdi.trabelsi@example.com',
        'Mehdi Trabelsi',
        '+216 52 987 654',
        'organic',
        65,
        'qualified',
        '{"company": "Trabelsi Consulting", "industry": "Management Consulting", "companySize": "50-200", "budget": "15000"}'::jsonb
    )
    RETURNING id INTO v_lead3_id;

    -- Lead 4: Cold lead, limited info, low score
    INSERT INTO marketing_leads (org_id, email, name, phone, source, score, status, metadata)
    VALUES (
        v_org_id,
        'guest@website.com',
        NULL,
        NULL,
        'direct',
        5,
        'new',
        '{}'::jsonb
    )
    RETURNING id INTO v_lead4_id;

    -- Lead 5: Paid ad lead, e-commerce
    INSERT INTO marketing_leads (org_id, email, name, phone, source, score, status, metadata)
    VALUES (
        v_org_id,
        'omar.jelliti@example.com',
        'Omar Jelliti',
        '+216 58 456 789',
        'facebook',
        30,
        'contacted',
        '{"company": "Jelliti Store", "industry": "E-Commerce", "companySize": "2-5"}'::jsonb
    )
    RETURNING id INTO v_lead5_id;

    -- Lead 6: Converted lead (already became a client)
    INSERT INTO marketing_leads (org_id, email, name, phone, source, score, status, metadata)
    VALUES (
        v_org_id,
        'rania.bouaziz@example.com',
        'Rania Bouaziz',
        '+216 20 111 222',
        'referral',
        90,
        'converted',
        '{"company": "Bouaziz Agency", "industry": "Digital Agency", "companySize": "10-25", "budget": "12000", "closedDate": "2026-05-01"}'::jsonb
    )
    RETURNING id INTO v_lead6_id;

    -- ──────────────────────────────────────────────────────────────────────
    -- 2. Touchpoints (for touchpoint_count scoring)
    -- ──────────────────────────────────────────────────────────────────────

    -- Lead 1: 3 touchpoints — website, email, call
    INSERT INTO touchpoints (lead_id, channel, source, medium, event_type, org_id)
    VALUES
        (v_lead1_id, 'website', 'google', 'organic', 'page_view', v_org_id),
        (v_lead1_id, 'email', 'referral', 'email', 'email_open', v_org_id),
        (v_lead1_id, 'phone', 'referral', 'phone', 'call_booked', v_org_id);

    -- Lead 2: 1 touchpoint
    INSERT INTO touchpoints (lead_id, channel, source, medium, event_type, org_id)
    VALUES
        (v_lead2_id, 'website', 'google', 'organic', 'page_view', v_org_id);

    -- Lead 3: 5 touchpoints — highly engaged
    INSERT INTO touchpoints (lead_id, channel, source, medium, event_type, org_id)
    VALUES
        (v_lead3_id, 'website', 'google', 'organic', 'page_view', v_org_id),
        (v_lead3_id, 'website', 'direct', 'none', 'pricing_view', v_org_id),
        (v_lead3_id, 'email', 'organic', 'email', 'email_click', v_org_id),
        (v_lead3_id, 'website', 'direct', 'none', 'demo_signup', v_org_id),
        (v_lead3_id, 'phone', 'organic', 'phone', 'demo_completed', v_org_id);

    -- Lead 4: 0 touchpoints

    -- Lead 5: 2 touchpoints
    INSERT INTO touchpoints (lead_id, channel, source, medium, event_type, org_id)
    VALUES
        (v_lead5_id, 'website', 'facebook', 'cpc', 'landing_view', v_org_id),
        (v_lead5_id, 'email', 'facebook', 'cpc', 'email_open', v_org_id);

    -- Lead 6: 4 touchpoints
    INSERT INTO touchpoints (lead_id, channel, source, medium, event_type, org_id)
    VALUES
        (v_lead6_id, 'website', 'google', 'organic', 'page_view', v_org_id),
        (v_lead6_id, 'email', 'referral', 'email', 'email_click', v_org_id),
        (v_lead6_id, 'phone', 'referral', 'phone', 'discovery_call', v_org_id),
        (v_lead6_id, 'email', 'referral', 'email', 'proposal_sent', v_org_id);

    RAISE NOTICE 'Seeded 6 marketing leads with touchpoints for org %', v_org_id;
END $$;

-- DOWN
DELETE FROM touchpoints WHERE lead_id IN (
    SELECT id FROM marketing_leads WHERE email IN (
        'ahmed.benali@example.com',
        'sarah.kthiri@example.com',
        'mehdi.trabelsi@example.com',
        'guest@website.com',
        'omar.jelliti@example.com',
        'rania.bouaziz@example.com'
    )
);
DELETE FROM marketing_leads WHERE email IN (
    'ahmed.benali@example.com',
    'sarah.kthiri@example.com',
    'mehdi.trabelsi@example.com',
    'guest@website.com',
    'omar.jelliti@example.com',
    'rania.bouaziz@example.com'
);

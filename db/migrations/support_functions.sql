-- Support Service Functions

CREATE OR REPLACE FUNCTION public.create_support_ticket(
  p_client_id BIGINT,
  p_subject VARCHAR,
  p_description TEXT,
  p_project_id BIGINT DEFAULT NULL,
  p_priority VARCHAR DEFAULT 'medium',
  p_category VARCHAR DEFAULT 'question',
  p_assigned_to VARCHAR DEFAULT NULL
) RETURNS support_tickets AS $$
DECLARE
  v_ticket support_tickets;
  v_ticket_number VARCHAR;
BEGIN
  -- Generate ticket number: TKT-YYYYMMDD-RANDOM
  v_ticket_number := 'TKT-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || floor(random() * 10000)::text;
  
  INSERT INTO support_tickets (
    ticket_number, client_id, project_id, subject, description,
    priority, category, assigned_to
  ) VALUES (
    v_ticket_number, p_client_id, p_project_id, p_subject, p_description,
    p_priority, p_category, p_assigned_to
  )
  RETURNING * INTO v_ticket;
  
  RETURN v_ticket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_support_ticket(
  p_id BIGINT,
  p_status VARCHAR DEFAULT NULL,
  p_priority VARCHAR DEFAULT NULL,
  p_category VARCHAR DEFAULT NULL,
  p_assigned_to VARCHAR DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS support_tickets AS $$
DECLARE
  v_ticket support_tickets;
BEGIN
  UPDATE support_tickets SET
    status = COALESCE(p_status, status),
    priority = COALESCE(p_priority, priority),
    category = COALESCE(p_category, category),
    assigned_to = COALESCE(p_assigned_to, assigned_to),
    description = COALESCE(p_description, description),
    resolved_at = CASE WHEN p_status = 'resolved' THEN NOW() ELSE resolved_at END,
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_ticket;
  
  RETURN v_ticket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_support_tickets() 
RETURNS SETOF support_tickets 
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM support_tickets ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_support_ticket_by_id(p_id BIGINT) 
RETURNS support_tickets 
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM support_tickets WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.get_support_messages_by_ticket(p_ticket_id BIGINT) 
RETURNS SETOF support_messages 
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM support_messages WHERE ticket_id = p_ticket_id ORDER BY created_at ASC;
$$;

CREATE OR REPLACE FUNCTION public.create_support_message(
  p_ticket_id BIGINT,
  p_sender_id VARCHAR,
  p_sender_type VARCHAR,
  p_message TEXT
) RETURNS support_messages AS $$
DECLARE
  v_msg support_messages;
BEGIN
  INSERT INTO support_messages (ticket_id, sender_id, sender_type, message)
  VALUES (p_ticket_id, p_sender_id, p_sender_type, p_message)
  RETURNING * INTO v_msg;
  
  RETURN v_msg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants
GRANT EXECUTE ON FUNCTION public.create_support_ticket TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_support_ticket TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_support_tickets TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_support_ticket_by_id TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_support_messages_by_ticket TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_support_message TO anon, authenticated;

-- Create test user directly in auth.users table
-- This bypasses email confirmation for testing purposes

-- First, let's create the user in the auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_sent_at,
  recovery_token,
  email_change_sent_at,
  email_change,
  email_change_token_new,
  email_change_token_current,
  phone_change_sent_at,
  phone_change,
  phone_change_token,
  reauthentication_sent_at,
  reauthentication_token,
  email_change_confirm_status,
  banned_until,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change_token_status,
  email_change_token_status,
  is_sso_user,
  deleted_at,
  is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'bruno.infojw@gmail.com',
  crypt('prova1234', gen_salt('bf')), -- Hash the password
  NOW(),
  NOW(),
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  '',
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  0,
  0,
  FALSE,
  NULL,
  FALSE
);

-- Get the user ID we just created
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Get the user ID
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'bruno.infojw@gmail.com';
    
    -- Insert into public.users table
    INSERT INTO public.users (
        id,
        email,
        full_name,
        business_name,
        phone,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        'bruno.infojw@gmail.com',
        'Bruno Test',
        'Bruno Wedding Photography',
        '+39 123 456 7890',
        NOW(),
        NOW()
    );
    
    -- Insert user settings
    INSERT INTO public.user_settings (
        id,
        user_id,
        email_notifications,
        auto_follow_up_days,
        business_hours_start,
        business_hours_end,
        timezone,
        email_signature,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        test_user_id,
        true,
        3,
        '09:00:00',
        '18:00:00',
        'Europe/Rome',
        'Bruno Test - Bruno Wedding Photography',
        NOW(),
        NOW()
    );
    
    -- Create some sample email templates
    INSERT INTO public.email_templates (
        id,
        user_id,
        name,
        template_type,
        subject,
        content,
        is_active,
        created_at,
        updated_at
    ) VALUES 
    (
        gen_random_uuid(),
        test_user_id,
        'Benvenuto',
        'welcome',
        'Grazie per il tuo interesse!',
        'Ciao {name}, grazie per averci contattato per il tuo matrimonio. Saremo felici di aiutarti a rendere il tuo giorno speciale indimenticabile.',
        true,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        test_user_id,
        'Follow-up',
        'follow_up',
        'Come possiamo aiutarti?',
        'Ciao {name}, volevo ricontattarti per vedere se hai bisogno di ulteriori informazioni sui nostri servizi per il tuo matrimonio.',
        true,
        NOW(),
        NOW()
    );
    
END $$;

-- Create test user account
-- This script creates a test user for bruno.infojw@gmail.com

-- First, we need to insert into auth.users (Supabase's auth table)
-- Note: In a real environment, this would be done through Supabase Auth API
-- For testing purposes, we'll create the user record directly

-- Insert into auth.users table (Supabase's authentication table)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token,
  email_change_token_current
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'bruno.infojw@gmail.com',
  crypt('prova1234', gen_salt('bf')), -- Hash the password
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the inserted user
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'bruno.infojw@gmail.com';
  
  -- Insert into our custom users table
  INSERT INTO public.users (
    id,
    email,
    full_name,
    business_name,
    phone,
    created_at,
    updated_at
  ) VALUES (
    user_uuid,
    'bruno.infojw@gmail.com',
    'Bruno Test',
    'Wedding Studio Test',
    '+39 123 456 7890',
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Insert default user settings
  INSERT INTO public.user_settings (
    id,
    user_id,
    email_notifications,
    auto_follow_up_days,
    business_hours_start,
    business_hours_end,
    timezone,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    user_uuid,
    true,
    3,
    '09:00:00',
    '18:00:00',
    'Europe/Rome',
    now(),
    now()
  ) ON CONFLICT (user_id) DO NOTHING;
  
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
    user_uuid,
    'Benvenuto - Prima Risposta',
    'welcome',
    'Grazie per il tuo interesse - {{business_name}}',
    'Ciao {{lead_name}},

Grazie per averci contattato per il tuo matrimonio del {{event_date}}!

Siamo entusiasti di poter essere parte del vostro giorno speciale. Ho ricevuto la vostra richiesta e vi risponderò entro 24 ore con tutte le informazioni sui nostri servizi.

Nel frattempo, potete visitare il nostro portfolio su [sito web] per vedere alcuni dei nostri lavori recenti.

A presto!
{{business_name}}',
    true,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    user_uuid,
    'Follow-up Disponibilità',
    'follow_up',
    'Disponibilità per {{event_date}} - {{business_name}}',
    'Ciao {{lead_name}},

Spero che stiate bene! Volevo aggiornarvi sulla disponibilità per il vostro matrimonio del {{event_date}}.

Abbiamo ancora la data libera e saremmo felici di discutere i dettagli del vostro evento speciale.

Quando sareste disponibili per una chiamata o un incontro?

Cordiali saluti,
{{business_name}}',
    true,
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;

END $$;

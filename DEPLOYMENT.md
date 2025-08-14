# Ettore - Deployment Guide

## Variabili d'Ambiente Richieste

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - URL del progetto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chiave anonima Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Chiave service role per operazioni server-side

### AI Integration
- `GROQ_API_KEY` - Chiave API per Groq (generazione email AI)

### Email Service
- `RESEND_API_KEY` - Chiave API per Resend (invio notifiche email)

### App Configuration
- `NEXT_PUBLIC_SITE_URL` - URL del sito in produzione (es: https://ettore.vercel.app)

## Setup Database

1. Eseguire gli script SQL in ordine:
   - `scripts/01-create-tables.sql` - Crea le tabelle principali
   - `scripts/02-add-email-logs-table.sql` - Aggiunge tabella log email
   - `scripts/03-update-user-settings-schema.sql` - Aggiorna schema impostazioni
   - `scripts/05-create-simple-test-user.sql` - Crea utente di test (opzionale)

2. Configurare Google OAuth in Supabase:
   - Andare su Authentication > Providers
   - Abilitare Google
   - Inserire Client ID e Secret da Google Cloud Console
   - Configurare redirect URLs

## Deploy su Vercel

1. Connettere repository GitHub a Vercel
2. Configurare le variabili d'ambiente nel dashboard Vercel
3. Il deploy avverrà automaticamente

## Post-Deploy

1. Testare login con email/password e Google OAuth
2. Verificare webhook endpoint: `https://your-domain.com/api/webhook/leads`
3. Testare generazione email AI
4. Configurare notifiche email

# Axiom Academy website

Maths tutoring and academic mentorship site. It's a plain HTML, CSS and JavaScript site with no build step, ready for Vercel.

## Folder layout

```
axiom-academy/
├── index.html          All page content (text, prices, sections, forms)
├── css/styles.css      Colours, fonts, layout
├── js/config.js        Your settings: WhatsApp number, email, database on/off
├── js/main.js          Menu, tabs, form checks, WhatsApp hand-off
├── api/submit.js       Optional Vercel function that saves form entries to Supabase
├── supabase/schema.sql Optional table for saved entries
└── assets/favicon.svg  Browser-tab icon (add your logo and photo here too)
```

## Common edits

| To change… | Edit |
| --- | --- |
| WhatsApp number, email | `js/config.js` |
| Prices, programme text, FAQs, About story | `index.html` (search for the words you want to change) |
| Colours | `css/styles.css`, the `:root` block at the top (`--navy`, `--gold`, …) |
| Fonts | The Google Fonts `<link>` in `index.html` and `font-family` in `styles.css` |
| Founder photo | Put `founder.jpg` in `assets/`, then replace the `<div class="portrait" …>` block with `<img src="assets/founder.jpg" alt="Alwande Ndlovu" class="portrait" style="object-fit:cover;width:100%">` |
| Form fields | `index.html`. Each field sits in a `<div class="field">`, and the `name` attribute becomes the label in the WhatsApp message. |

## Run it on your computer

Open `index.html` in a browser, or for a local server:

```bash
npx serve .
```

## Put it on Vercel

1. Push this folder to a new GitHub repository.
2. On vercel.com, choose **Add New → Project**, then import the repository.
3. Framework preset: **Other**. Leave the build command and output directory empty.
4. Click **Deploy**. The site goes live at `your-project.vercel.app`.
5. Every `git push` updates the live site automatically.

Or use the CLI: `npm i -g vercel`, then run `vercel` inside the folder (and `vercel --prod` to publish).

### Your own domain

1. Buy the domain (e.g. `axiomacademy.co.za`) from a South African registrar.
2. In Vercel, go to **Project → Settings → Domains → Add** and enter the domain.
3. Add the DNS records Vercel shows you at your registrar. HTTPS is set up automatically.

## Saving form entries (optional, Supabase)

By default, the forms hand the details to WhatsApp. To also keep every entry in a database:

1. Create a Supabase project, then run `supabase/schema.sql` in the SQL Editor.
2. In Vercel, go to **Settings → Environment Variables** and add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret: never put it in front-end files)
3. Set `saveToDatabase: true` in `js/config.js`, then push.
4. View entries in Supabase under **Table Editor → submissions**, and update the `status` column as you follow up.

The table has Row Level Security on with no public policies, so learners' details can only be reached through the server function and your Supabase dashboard. This matters for POPIA.

# Empowered By Poppy — newsletter landing page

A standalone sign-up page for newsletter.empoweredbypoppy.com.
It is completely separate from your main website and can't affect it.

## What's in this folder

    public/index.html                  the whole page (design, copy, form, settings)
    public/logo.png                    your logo
    public/favicon.svg                 the little purple triangle in the browser tab
    netlify/functions/subscribe.mjs    sends sign-ups to Brevo (once switched on)
    netlify.toml                       tells Netlify how to publish the site

## The three settings you'll change

Open public/index.html and scroll to the block marked SETTINGS near the bottom:

- previewMode: true  → keep this until Brevo is connected, then change to false
- privacyPolicyUrl: "" → paste your privacy policy link between the quotes
- endpoint → leave as it is

While previewMode is true, the form checks people's details but never sends
anything, never shows the success message, and shows a "Preview mode" notice.

## Updating your logo

The logo is public/logo.png. To change it, replace that file with a new one
with the same name (a transparent PNG, trimmed close to the edges, works best).

## Publishing on Netlify (step by step)

Use GitHub, the same way as your main site, because Netlify's drag-and-drop
uploads don't include the Brevo function.

1. On github.com, create a NEW repository called ebp-newsletter (private is fine).
   Don't use your ebp-website repo.
2. Click "uploading an existing file", drag in everything inside this folder
   (public, netlify, netlify.toml, README.md), and click Commit changes.
3. In Netlify: Add new project → Import an existing project → GitHub →
   choose ebp-newsletter.
4. Netlify reads netlify.toml, so leave the build settings blank. Click Deploy.
5. After a minute you'll get a link like something-random.netlify.app. Open it
   on your phone to check it.

## Adding newsletter.empoweredbypoppy.com

1. In Netlify, open the new project → Domain management → Add a domain →
   type newsletter.empoweredbypoppy.com.
2. Netlify will show you a CNAME record. Go to wherever your domain's DNS is
   managed (currently probably Wix) and add:
       Type: CNAME   Host/Name: newsletter   Value: your-site-name.netlify.app
3. Wait (usually under an hour). Netlify then adds HTTPS automatically.

Adding a "newsletter" subdomain doesn't change empoweredbypoppy.com itself.

## Connecting Brevo (the Claude in Chrome step)

1. In Brevo: Contacts → Lists → create a list (e.g. "Weekly newsletter").
   Note its ID number.
2. In Brevo: check the contact attributes FIRSTNAME and LASTNAME exist
   (they do by default).
3. In Brevo: SMTP & API → API keys → create a key. Copy it.
4. In Netlify: Project configuration → Environment variables → add:
       BREVO_API_KEY = (your key)
       BREVO_LIST_ID = (the list number, e.g. 7)
5. In public/index.html set previewMode: false and commit the change on GitHub.
   Netlify redeploys automatically.
6. Sign up with your own email and check the contact appears in the list.

The API key only lives in Netlify, never in the page, so nobody can see it.
Trigger your welcome email from Brevo with an automation: "Contact added to list".

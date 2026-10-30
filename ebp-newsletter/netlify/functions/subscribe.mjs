// Adds a newsletter sign-up to Brevo.
// Needs two environment variables in Netlify (Site configuration > Environment variables):
//   BREVO_API_KEY  - your Brevo API key (never put this in index.html)
//   BREVO_LIST_ID  - the number of the Brevo list subscribers should join
// Until both are set, this returns "not configured" and nobody is told they're subscribed.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const reply = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export default async (req) => {
  if (req.method !== "POST") return reply(405, { ok: false, error: "method_not_allowed" });

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!apiKey || !Number.isInteger(listId)) {
    return reply(503, { ok: false, error: "not_configured" });
  }

  let data = {};
  try {
    const type = req.headers.get("content-type") || "";
    data = type.includes("application/json")
      ? await req.json()
      : Object.fromEntries(await req.formData());
  } catch {
    return reply(400, { ok: false, error: "bad_request" });
  }

  // Honeypot: real people never fill this in
  if (data.company) return reply(200, { ok: true });

  const firstName = String(data.firstName || "").trim().slice(0, 60);
  const lastName = String(data.lastName || "").trim().slice(0, 60);
  const email = String(data.email || "").trim().toLowerCase();

  if (!firstName) return reply(400, { ok: false, field: "firstName", message: "Add your first name." });
  if (!lastName) return reply(400, { ok: false, field: "lastName", message: "Add your last name." });
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return reply(400, { ok: false, field: "email", message: "That email doesn’t look right. Check for typos." });
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: firstName, LASTNAME: lastName },
        listIds: [listId],
        updateEnabled: true, // someone already in Brevo just gets added to the list
      }),
    });

    if (res.status === 201 || res.status === 204) return reply(200, { ok: true });

    const err = await res.json().catch(() => ({}));
    console.error("Brevo error", res.status, err);
    if (res.status === 400 && /email/i.test(err.message || "")) {
      return reply(400, { ok: false, field: "email", message: "Brevo couldn’t accept that email. Check it and try again." });
    }
    return reply(502, { ok: false, error: "brevo_error" });
  } catch (e) {
    console.error("Brevo request failed", e);
    return reply(502, { ok: false, error: "brevo_unreachable" });
  }
};

export const config = { path: "/api/subscribe" };

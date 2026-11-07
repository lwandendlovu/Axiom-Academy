// Vercel serverless function: saves a form entry to Supabase.
// Only used when saveToDatabase is true in js/config.js.
// Needs two environment variables in Vercel (Project > Settings > Environment Variables):
//   SUPABASE_URL                e.g. https://abcd1234.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   from Supabase > Project Settings > API (keep this secret)

const ALLOWED_TYPES = ['tutoring', 'mentorship'];
const MAX_FIELDS = 30;
const MAX_LEN = 1000;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const { type, data, company } = body;

  // Spam trap: real people never fill the hidden "company" field
  if (company) return res.status(200).json({ ok: true });

  if (!ALLOWED_TYPES.includes(type) || !data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid submission' });
  }

  // Keep only short text values
  const clean = {};
  for (const [k, v] of Object.entries(data).slice(0, MAX_FIELDS)) {
    if (typeof v === 'string') clean[String(k).slice(0, 60)] = v.slice(0, MAX_LEN);
  }

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ type, data: clean }),
    });
    if (!r.ok) return res.status(502).json({ error: 'Could not save' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'Could not save' });
  }
};

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}

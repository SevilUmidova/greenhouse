// send-command.js
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const body = JSON.parse(event.body || '{}');
    const cmd = (body.cmd || '').toString().toUpperCase();
    if (!['OPEN','CLOSE'].includes(cmd)) return { statusCode: 400, body: 'Bad command' };

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) return { statusCode: 500, body: 'Missing server env vars' };

    const resp = await fetch(`${supabaseUrl}/rest/v1/commands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ cmd })
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error('send-command error', t);
      return { statusCode: 502, body: 'Failed to store command' };
    }
    const inserted = await resp.json();
    return { statusCode: 200, body: JSON.stringify({ ok: true, id: inserted[0].id }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
};

// ingest.js  — uses global fetch, no node-fetch
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const body = JSON.parse(event.body || '{}');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return { statusCode: 500, body: 'Missing server env vars' };
    }

    const insertBody = {
      soil: body.soil || null,
      temp: body.temp || null,
      light: body.light || null,
      salt: body.salt || null,
      servo: body.servo || null
    };

    const resp = await fetch(`${supabaseUrl}/rest/v1/sensor_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(insertBody)
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Supabase insert failed', text);
      return { statusCode: 502, body: 'Supabase insert failed' };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
};

// get-latest.js
exports.handler = async function() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return { statusCode: 500, body: 'Missing server env vars' };
    }

    const q = `${supabaseUrl}/rest/v1/sensor_data?select=*&order=received_at.desc&limit=1`;
    const resp = await fetch(q, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error('get-latest error', t);
      return { statusCode: 502, body: 'Bad gateway' };
    }

    const json = await resp.json();
    return { statusCode: 200, body: JSON.stringify(json[0] || {}) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
};

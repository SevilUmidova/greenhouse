// poll-command.js
exports.handler = async function() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) return { statusCode: 500, body: 'Missing server env vars' };

    // 1) select the oldest unconsumed command
    const selectUrl = `${supabaseUrl}/rest/v1/commands?select=*&consumed=eq.false&order=created_at.asc&limit=1`;
    const selResp = await fetch(selectUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!selResp.ok) {
      const t = await selResp.text();
      console.error('select error', t);
      return { statusCode: 502, body: 'Select failed' };
    }

    const arr = await selResp.json();
    if (!arr || arr.length === 0) return { statusCode: 200, body: JSON.stringify({ cmd: null }) };

    const cmdRow = arr[0];

    // 2) mark it consumed
    const patchUrl = `${supabaseUrl}/rest/v1/commands?id=eq.${cmdRow.id}`;
    const patchResp = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ consumed: true })
    });

    if (!patchResp.ok) {
      console.error('patch failed', await patchResp.text());
      // still return the command
    }

    return { statusCode: 200, body: JSON.stringify({ cmd: cmdRow.cmd }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
};

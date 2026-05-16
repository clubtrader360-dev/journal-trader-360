export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return res.status(500).json({ error: 'DISCORD_WEBHOOK_URL not set' });

  const expectedToken = process.env.PROXY_AUTH_TOKEN;
  if (expectedToken) {
    const authHeader = req.headers['authorization'] || '';
    if (authHeader !== `Bearer ${expectedToken}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const text = response.status === 204 ? null : await response.text();
    return res.status(200).json({
      ok: response.ok,
      discordStatus: response.status,
      discordResponse: text,
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}

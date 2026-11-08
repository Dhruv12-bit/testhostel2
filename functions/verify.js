export async function onRequest(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response(JSON.stringify({ valid: false, error: 'No key provided' }), { status: 400 });
  }

  const licenseData = await context.env.LICENSES.get(key, { type: 'json' });

  if (licenseData && licenseData.active) {
    return new Response(JSON.stringify({ valid: true }), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } else {
    return new Response(JSON.stringify({ valid: false, error: 'Invalid or revoked license' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
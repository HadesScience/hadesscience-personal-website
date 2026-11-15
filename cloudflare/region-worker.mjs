export default {
  fetch(request) {
    const headers = { 'Cache-Control': 'private, no-store' };
    if (new URL(request.url).pathname !== '/_region') {
      return new Response(null, { status: 404, headers });
    }
    if (request.method !== 'GET') {
      return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET' } });
    }
    const country = request.cf?.country;
    return Response.json({
      showInternationalLinks: typeof country === 'string' &&
        /^[A-Z]{2}$/.test(country) && country !== 'CN' && country !== 'XX'
    }, { headers });
  }
};

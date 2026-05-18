exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/html; charset=utf-8',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const url = event.queryStringParameters && event.queryStringParameters.url;
  if (!url) return { statusCode: 400, headers, body: 'url manquant' };

  // Liste blanche des domaines autorisés
  const allowed = [
    'info.agriculture.gouv.fr',
    'chlorofil.fr',
    'normandie.draaf.agriculture.gouv.fr',
    'educagri.fr',
    'www.chambres-agriculture.fr',
    'formagri.org',
    'www.legifrance.gouv.fr',
    'www.francecompetences.fr',
    'normandie.dreets.gouv.fr',
    'dares.travail-emploi.gouv.fr',
    'travail-emploi.gouv.fr',
    'www.ocapiat.fr',
    'www.cariforefnormandie.fr',
    'intercariforef.org',
    'www.qualiopi.com',
    'www.cnfpt.fr',
    'www.capcollectif.com',
  ];

  let hostname;
  try { hostname = new URL(url).hostname; }
  catch(e) { return { statusCode: 400, headers, body: 'URL invalide' }; }

  if (!allowed.includes(hostname)) {
    return { statusCode: 403, headers, body: 'Domaine non autorisé : ' + hostname };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VeilleCFA/1.0)',
        'Accept': 'text/html,*/*;q=0.9',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
    });
    clearTimeout(timer);
    if (!resp.ok) return { statusCode: resp.status, headers, body: 'HTTP ' + resp.status };
    const text = await resp.text();
    return { statusCode: 200, headers, body: text };
  } catch(e) {
    return { statusCode: 500, headers, body: 'Erreur : ' + e.message };
  }
};

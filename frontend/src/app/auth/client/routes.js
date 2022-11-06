export function buildRoute(route) {
  return process.env.NEXT_PUBLIC_BACKEND_URL + route;
}

export function fetchIgnoreCors(src) {
  return fetch(src, {
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Origin': window.location.hostname,
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
    },
  })
}
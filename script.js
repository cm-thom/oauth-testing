authBtnEl = document.getElementById('auth-btn');
refreshBtnEl = document.getElementById('refresh-token-btn');


const clientId = 'ca2ce6aeb1fa483bb8544ccdc4ece44c';
const redirectUri = 'http://localhost:5500/';

refreshBtnEl.addEventListener('click', function() {
  console.log('refresh token btn!');
  refreshAccessToken();
})

authBtnEl.addEventListener('click', function() {

    let codeVerifier = generateRandomString(128);

    generateCodeChallenge(codeVerifier).then(codeChallenge => {
    let state = generateRandomString(16);
    let scope = 'user-read-private user-read-email';

    localStorage.setItem('code_verifier', codeVerifier);

  let args = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });

  window.location = 'https://accounts.spotify.com/authorize?' + args;
});
});



function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    console.log(text);
    return text;
  }

  async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
  
    return base64encode(digest);
  }

  
function getAccessToken() {
  const urlParams = new URLSearchParams(window.location.search);
  let code = urlParams.get('code');


  let codeVerifier = localStorage.getItem('code_verifier');

  let body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier
  });


  const response = fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      localStorage.setItem('access_token', data.access_token);
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
};

  function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      // There is no refresh token, so the user needs to log in again
      return;
    }
  
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId
    });
  
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP status ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('expires_at', Date.now() + (data.expires_in * 1000));
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }


// const accessToken = localStorage.getItem('access_token');

// fetch('https://api.spotify.com/v1/me', {
//   headers: {
//     'Authorization': 'Bearer ' + accessToken
//   }
// })
//   .then(response => {
//     if (!response.ok) {
//       throw new Error('HTTP status ' + response.status);
//     }
//     return response.json();
//   })
//   .then(data => {
//     console.log(data);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });
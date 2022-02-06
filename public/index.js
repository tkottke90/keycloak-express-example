const code = document.getElementById('local');
const login = document.getElementById('login')

const local = { ...window.location }

local.hashDetails = new Map(local.hash.slice(1).split('&').map(item => item.split('=')));

code.innerText = JSON.stringify({ ...local, hashDetails: local.hashDetails.entries() }, null, 2);

// const token = local.hashDetails.find(([ hashName, hashValue]) => {
//   return hashName === 'access_token';
// })

const token = local.hashDetails.get('access_token');

if (token) {
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${token}`)
  fetch('/login', { headers })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return ({
          error: true,
          response
        })
      }
    })
    .then(data => {
      login.innerText = JSON.stringify(data, null, 2);
    })
}

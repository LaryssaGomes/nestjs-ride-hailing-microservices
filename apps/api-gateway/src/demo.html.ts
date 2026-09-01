export const DEMO_HTML = `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Ride Hailing Microservices - Demo</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  :root {
    --bg: #0f172a;
    --panel: #16213e;
    --border: #29314f;
    --text: #e6e9f2;
    --muted: #93a0c2;
    --accent: #22d3ee;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  header {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
  }
  header h1 { font-size: 16px; margin: 0; }
  header p { margin: 0; color: var(--muted); font-size: 13px; }
  header a { color: var(--accent); text-decoration: none; margin-left: auto; font-size: 13px; }
  main {
    flex: 1;
    display: flex;
    min-height: 0;
  }
  #map { flex: 1; }
  aside {
    width: 300px;
    border-left: 1px solid var(--border);
    padding: 16px;
    overflow-y: auto;
    background: var(--panel);
  }
  aside h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin: 0 0 10px; }
  form { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  input {
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 13px;
  }
  button {
    background: var(--accent);
    color: #04222b;
    border: none;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  button:disabled { opacity: 0.5; cursor: default; }
  .rider {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 8px;
  }
  .rider .name { font-weight: 600; font-size: 13px; }
  .rider .email { color: var(--muted); font-size: 12px; margin-bottom: 8px; }
  .rider button { width: 100%; }
  #status { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #10b981; margin-right: 5px; }
</style>
</head>
<body>
  <header>
    <h1>Ride Hailing Microservices</h1>
    <p><span class="dot"></span>demo ao vivo - NestJS + RabbitMQ + Postgres + MongoDB</p>
    <a href="https://github.com/LaryssaGomes/nestjs-ride-hailing-microservices" target="_blank">ver o codigo no GitHub &rarr;</a>
  </header>
  <main>
    <div id="map"></div>
    <aside>
      <h2>Cadastrar rider</h2>
      <form id="rider-form">
        <input id="firstName" placeholder="Nome" required />
        <input id="lastName" placeholder="Sobrenome" required />
        <input id="email" type="email" placeholder="Email" required />
        <button type="submit">Cadastrar</button>
      </form>
      <div id="status"></div>
      <h2 style="margin-top: 20px;">Riders</h2>
      <div id="riders"></div>
    </aside>
  </main>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function () {
  var BASE = [-23.5505, -46.6333];
  var map = L.map('map').setView(BASE, 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  var markers = {};
  var trails = {};
  var statusEl = document.getElementById('status');

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function riderStart(riderId) {
    var seed = Number(riderId) || 1;
    var angle = (seed * 47) % 360 * (Math.PI / 180);
    var radius = 0.01 + (seed % 5) * 0.004;
    return [BASE[0] + Math.cos(angle) * radius, BASE[1] + Math.sin(angle) * radius];
  }

  function ensureMarker(riderId, label, latlng) {
    if (!markers[riderId]) {
      markers[riderId] = L.marker(latlng).addTo(map).bindPopup(label);
      trails[riderId] = L.polyline([latlng], { color: '#22d3ee' }).addTo(map);
    } else {
      markers[riderId].setLatLng(latlng);
      trails[riderId].addLatLng(latlng);
    }
  }

  function loadRiders() {
    fetch('/riders')
      .then(function (r) { return r.json(); })
      .then(function (riders) {
        var container = document.getElementById('riders');
        container.innerHTML = '';
        riders.forEach(function (rider) {
          var el = document.createElement('div');
          el.className = 'rider';
          el.innerHTML = '<div class="name">' + rider.firstName + ' ' + rider.lastName + '</div>' +
            '<div class="email">' + rider.email + '</div>' +
            '<button data-id="' + rider.id + '">Simular corrida</button>';
          container.appendChild(el);

          var start = riderStart(rider.id);
          ensureMarker(rider.id, rider.firstName + ' ' + rider.lastName, start);

          fetch('/riders/coordinates/' + rider.id)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
              if (data && data.coordinates && data.coordinates.length) {
                var last = data.coordinates[data.coordinates.length - 1];
                ensureMarker(rider.id, rider.firstName + ' ' + rider.lastName, [last.lat, last.lng]);
              }
            })
            .catch(function () {});
        });

        container.querySelectorAll('button[data-id]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            simulateRide(btn.getAttribute('data-id'), btn);
          });
        });
      });
  }

  function simulateRide(riderId, btn) {
    btn.disabled = true;
    btn.textContent = 'Em corrida...';
    var pos = riderStart(riderId);
    var step = 0;
    var totalSteps = 18;

    var interval = setInterval(function () {
      step++;
      pos = [pos[0] + (Math.random() - 0.5) * 0.003, pos[1] + (Math.random() - 0.5) * 0.003];
      ensureMarker(riderId, 'rider ' + riderId, pos);

      fetch('/riders/coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: Number(riderId),
          lat: pos[0],
          lng: pos[1],
          timestamp: new Date().toISOString()
        })
      }).catch(function () {});

      if (step >= totalSteps) {
        clearInterval(interval);
        btn.disabled = false;
        btn.textContent = 'Simular corrida';
      }
    }, 700);
  }

  document.getElementById('rider-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var firstName = document.getElementById('firstName').value;
    var lastName = document.getElementById('lastName').value;
    var email = document.getElementById('email').value;
    setStatus('Cadastrando...');

    fetch('/riders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        email: email,
        userId: Math.floor(Math.random() * 1000000),
        isActive: true
      })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('falha ao cadastrar');
        return r.json();
      })
      .then(function () {
        setStatus('Rider cadastrado!');
        document.getElementById('rider-form').reset();
        loadRiders();
      })
      .catch(function () {
        setStatus('Erro ao cadastrar rider.');
      });
  });

  loadRiders();
})();
</script>
</body>
</html>
`;

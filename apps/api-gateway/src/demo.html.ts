export const DEMO_HTML = `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Ride Hailing Microservices - Demo</title>
<style>
  :root {
    --bg: #0d0d10;
    --panel: #17171c;
    --border: #2a2a32;
    --text: #ece8e1;
    --muted: #96938c;
    --accent: #e0a339;
    --mq: #ff6600;
    --ok: #7c93b3;
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
  aside {
    width: 340px;
    border-right: 1px solid var(--border);
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
    color: #241a08;
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
  .rider .email { color: var(--muted); font-size: 12px; margin-bottom: 4px; }
  .rider .count { color: var(--muted); font-size: 11px; margin-bottom: 8px; }
  .rider button { width: 100%; }
  #status { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #10b981; margin-right: 5px; }

  #monitor {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  #monitor h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin: 16px 20px 8px; }
  #diagram-wrap { max-width: 560px; margin: 0 auto; padding: 0 20px; width: 100%; }
  #diagram rect {
    fill: #1c1c22;
    stroke: var(--border);
    stroke-width: 1;
    transition: fill 0.15s ease, stroke 0.15s ease;
  }
  #diagram rect.active { fill: var(--accent); stroke: var(--accent); }
  #diagram rect.active.mq { fill: var(--mq); stroke: var(--mq); }
  #diagram text { fill: var(--text); font-size: 8px; font-family: inherit; }
  #diagram .sub { fill: var(--muted); font-size: 6.5px; }
  #diagram line { stroke: var(--border); stroke-width: 1; }
  #diagram-caption { color: var(--muted); font-size: 11px; line-height: 1.5; margin: 10px 4px 0; text-align: center; }
  #diagram rect.node { cursor: help; }
  #tooltip {
    position: fixed;
    display: none;
    max-width: 240px;
    background: #08080a;
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 12px;
    line-height: 1.5;
    padding: 8px 10px;
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    pointer-events: none;
    z-index: 2000;
  }
  #tooltip b { color: var(--accent); }
  .pulse-dot { fill: var(--mq); filter: drop-shadow(0 0 3px var(--mq)); }
  #log {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    background: #08080a;
    margin: 12px 20px 20px;
    border-radius: 6px;
    padding: 10px 12px;
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.7;
  }
  #log div { white-space: pre-wrap; word-break: break-word; }
  #log .comp-gw { color: var(--accent); }
  #log .comp-mq { color: var(--mq); }
  #log .comp-svc { color: var(--ok); }
  #log .muted { color: var(--muted); }
</style>
</head>
<body>
  <header>
    <h1>Ride Hailing Microservices</h1>
    <p><span class="dot"></span>demo ao vivo - NestJS + RabbitMQ + Postgres + MongoDB</p>
    <a href="https://github.com/LaryssaGomes/nestjs-ride-hailing-microservices" target="_blank">ver o codigo no GitHub &rarr;</a>
  </header>
  <main>
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
    <div id="monitor">
      <h2>Arquitetura (ao vivo)</h2>
      <div id="diagram-wrap">
        <svg id="diagram" viewBox="0 0 300 185" width="100%">
          <line x1="150" y1="26" x2="150" y2="38" />
          <line x1="150" y1="58" x2="150" y2="70" />
          <line x1="150" y1="90" x2="58" y2="108" />
          <line x1="150" y1="90" x2="150" y2="108" />
          <line x1="150" y1="90" x2="242" y2="108" />
          <line x1="58" y1="128" x2="58" y2="148" />
          <line x1="150" y1="128" x2="150" y2="148" />
          <line x1="242" y1="128" x2="242" y2="148" />

          <rect id="n-browser" x="110" y="4" width="80" height="22" rx="4" class="node" />
          <text x="150" y="18" text-anchor="middle">Browser</text>

          <rect id="n-gateway" x="105" y="38" width="90" height="20" rx="4" class="node" />
          <text x="150" y="51" text-anchor="middle">api-gateway</text>

          <rect id="n-mq" x="110" y="70" width="80" height="20" rx="4" class="node mq" />
          <text x="150" y="83" text-anchor="middle">RabbitMQ</text>

          <rect id="n-auth" x="18" y="108" width="80" height="20" rx="4" class="node" />
          <text x="58" y="121" text-anchor="middle">authentications</text>

          <rect id="n-rider" x="112" y="108" width="76" height="20" rx="4" class="node" />
          <text x="150" y="121" text-anchor="middle">rider</text>

          <rect id="n-logging" x="204" y="108" width="76" height="20" rx="4" class="node" />
          <text x="242" y="121" text-anchor="middle">logging</text>

          <rect id="n-authdb" x="18" y="148" width="80" height="26" rx="4" class="node" />
          <text x="58" y="159" text-anchor="middle">Postgres</text>
          <text x="58" y="169" text-anchor="middle" class="sub">authDb</text>

          <rect id="n-ridersdb" x="112" y="148" width="76" height="26" rx="4" class="node" />
          <text x="150" y="159" text-anchor="middle">Postgres</text>
          <text x="150" y="169" text-anchor="middle" class="sub">riders_db</text>

          <rect id="n-loggingdb" x="204" y="148" width="76" height="26" rx="4" class="node" />
          <text x="242" y="159" text-anchor="middle">MongoDB</text>
          <text x="242" y="169" text-anchor="middle" class="sub">logging-db</text>
        </svg>
        <p id="diagram-caption">rider recebe mensagens via RabbitMQ de 3 servicos: api-gateway (cadastro e consultas), authentications (fluxo completo de /auth/register) e logging (toda consulta de coordenadas).</p>
      </div>
      <h2>Eventos</h2>
      <div id="log"></div>
    </div>
  </main>
  <div id="tooltip"></div>

<script>
(function () {
  var statusEl = document.getElementById('status');
  var logEl = document.getElementById('log');

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  // ---- painel de eventos ----
  function log(html) {
    var line = document.createElement('div');
    line.innerHTML = html;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  // ---- diagrama animado: bolinha percorrendo o caminho real da mensagem ----
  var flowSteps = {
    register: [
      { id: 'n-gateway', pt: [150, 48] },
      { id: 'n-mq', pt: [150, 80] },
      { id: 'n-rider', pt: [150, 118] },
      { id: 'n-ridersdb', pt: [150, 161] }
    ],
    ride: [
      { id: 'n-gateway', pt: [150, 48] },
      { id: 'n-mq', pt: [150, 80] },
      { id: 'n-logging', pt: [242, 118] },
      { id: 'n-loggingdb', pt: [242, 161] }
    ],
    lookup: [
      { id: 'n-logging', pt: [242, 118] },
      { id: 'n-mq', pt: [150, 80] },
      { id: 'n-rider', pt: [150, 118] }
    ]
  };

  function flash(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('active');
    setTimeout(function () { el.classList.remove('active'); }, 450);
  }

  function chase(routeName) {
    var steps = flowSteps[routeName];
    if (!steps || !steps.length) return;

    var svgNS = 'http://www.w3.org/2000/svg';
    var dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('r', '3.5');
    dot.setAttribute('class', 'pulse-dot');
    dot.setAttribute('cx', steps[0].pt[0]);
    dot.setAttribute('cy', steps[0].pt[1]);
    document.getElementById('diagram').appendChild(dot);
    flash(steps[0].id);

    var segDuration = 240;
    var segIndex = 0;

    function animateSegment() {
      if (segIndex >= steps.length - 1) {
        dot.remove();
        return;
      }
      var p0 = steps[segIndex].pt;
      var p1 = steps[segIndex + 1].pt;
      var start = null;

      function frame(ts) {
        if (!start) start = ts;
        var t = Math.min((ts - start) / segDuration, 1);
        dot.setAttribute('cx', p0[0] + (p1[0] - p0[0]) * t);
        dot.setAttribute('cy', p0[1] + (p1[1] - p0[1]) * t);
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          segIndex++;
          flash(steps[segIndex].id);
          animateSegment();
        }
      }
      requestAnimationFrame(frame);
    }
    animateSegment();
  }

  // ---- tooltip explicando o porque de cada peca ----
  var explanations = {
    'n-browser': 'Interface simples que so consome a API real (fetch), sem framework de front-end - o foco da demo e o backend.',
    'n-gateway': 'api-gateway: ponto unico de entrada HTTP. Traduz requisicoes REST em mensagens assincronas para os microsservicos - quem consome a API nao precisa saber que existem 4 servicos por tras.',
    'n-mq': 'RabbitMQ: desacopla os servicos entre si. Se o servico de rider cair, o api-gateway continua no ar e as mensagens ficam enfileiradas ate ele voltar - nao e uma chamada HTTP direta travando tudo.',
    'n-auth': 'authentications: login, registro e emissao de JWT isolados dos outros servicos. Trocar a estrategia de autenticacao no futuro fica restrito a este servico.',
    'n-rider': 'rider: dono dos dados cadastrais. Usa TypeORM + Postgres porque sao dados relacionais com necessidade de integridade forte (email unico, chaves).',
    'n-logging': 'logging: recebe um volume alto de eventos (coordenadas de GPS a cada poucos segundos). Isolado dos outros servicos pra esse volume de escrita nao afetar o resto do sistema.',
    'n-authdb': 'Postgres (authDb): banco relacional dedicado - dados de usuario exigem constraints (email unico, senha), SQL com integridade forte encaixa bem aqui.',
    'n-ridersdb': 'Postgres (riders_db): database-per-service - cada microsservico e dono dos seus proprios dados, nenhum outro servico acessa essa tabela diretamente.',
    'n-loggingdb': 'MongoDB (logging-db): banco de documentos, sem schema rigido. Coordenadas de GPS sao escritas em alto volume e nao precisam de relacoes complexas - NoSQL escreve e escala mais facil aqui.'
  };

  var tooltipEl = document.getElementById('tooltip');
  document.querySelectorAll('#diagram rect.node').forEach(function (rect) {
    rect.addEventListener('mouseenter', function () {
      var text = explanations[rect.id];
      if (!text) return;
      tooltipEl.textContent = text;
      tooltipEl.style.display = 'block';
    });
    rect.addEventListener('mousemove', function (e) {
      tooltipEl.style.left = (e.clientX + 14) + 'px';
      tooltipEl.style.top = (e.clientY + 14) + 'px';
    });
    rect.addEventListener('mouseleave', function () {
      tooltipEl.style.display = 'none';
    });
  });

  // ---- simulacao de corrida (posta uma sequencia de coordenadas) ----
  function postCoordinate(riderId, pos) {
    log('<span class="comp-gw">[api-gateway]</span> POST /riders/coordinates');
    log('<span class="comp-mq">[RabbitMQ]</span> publicado -&gt; fila <b>coordinate_rider_queue</b>');
    chase('ride');
    return fetch('/riders/coordinates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        riderId: Number(riderId),
        lat: pos[0],
        lng: pos[1],
        timestamp: new Date().toISOString()
      })
    }).then(function (r) {
      if (r.ok) {
        log('<span class="comp-svc">[logging]</span> consumiu da fila, salvou no MongoDB (' +
          pos[0].toFixed(4) + ', ' + pos[1].toFixed(4) + ')');
      }
      return r;
    }).catch(function () {});
  }

  function simulateRide(riderId, btn) {
    btn.disabled = true;
    btn.textContent = 'Em corrida...';
    var base = [-23.5505 + (Number(riderId) % 7) * 0.002, -46.6333 + (Number(riderId) % 5) * 0.002];
    var step = 0;
    var totalSteps = 8;

    var interval = setInterval(function () {
      step++;
      var pos = [base[0] + step * 0.0015, base[1] + step * 0.0012];
      postCoordinate(riderId, pos).then(function () {
        var countEl = document.querySelector('.rider[data-rider-id="' + riderId + '"] .count');
        if (countEl) {
          var n = (parseInt(countEl.getAttribute('data-count') || '0', 10)) + 1;
          countEl.setAttribute('data-count', n);
          countEl.textContent = n + ' coordenada(s) registrada(s)';
        }
      });

      if (step >= totalSteps) {
        clearInterval(interval);
        btn.disabled = false;
        btn.textContent = 'Simular corrida';
      }
    }, 700);
  }

  function loadRiders() {
    fetch('/riders')
      .then(function (r) { return r.json(); })
      .then(function (riders) {
        var container = document.getElementById('riders');
        container.innerHTML = '';
        riders.forEach(function (rider) {
          var name = rider.firstName + ' ' + rider.lastName;
          var el = document.createElement('div');
          el.className = 'rider';
          el.setAttribute('data-rider-id', rider.id);
          el.innerHTML = '<div class="name">' + name + '</div>' +
            '<div class="email">' + rider.email + '</div>' +
            '<div class="count" data-count="0">carregando...</div>' +
            '<button data-id="' + rider.id + '">Simular corrida</button>';
          container.appendChild(el);

          log('<span class="comp-svc">[logging]</span> consultando rider #' + rider.id + ' via RabbitMQ (fila <b>rider_queue</b>)');
          chase('lookup');
          fetch('/riders/coordinates/' + rider.id)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
              if (data && data.riders && data.riders.id) {
                log('<span class="comp-svc">[rider]</span> respondeu via RabbitMQ com os dados do rider #' + rider.id);
              }
              var countEl = el.querySelector('.count');
              var n = data && data.coordinates ? data.coordinates.length : 0;
              countEl.setAttribute('data-count', n);
              countEl.textContent = n + ' coordenada(s) registrada(s)';
            })
            .catch(function () {
              el.querySelector('.count').textContent = '0 coordenada(s) registrada(s)';
            });
        });

        container.querySelectorAll('button[data-id]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            simulateRide(btn.getAttribute('data-id'), btn);
          });
        });
      });
  }

  document.getElementById('rider-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var firstName = document.getElementById('firstName').value;
    var lastName = document.getElementById('lastName').value;
    var email = document.getElementById('email').value;
    setStatus('Cadastrando...');

    log('<span class="comp-gw">[api-gateway]</span> POST /riders');
    log('<span class="comp-mq">[RabbitMQ]</span> publicado -&gt; fila <b>rider_queue</b>');
    chase('register');

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
      .then(function (rider) {
        log('<span class="comp-svc">[rider]</span> consumiu da fila, rider #' + rider.id + ' salvo no Postgres (riders_db)');
        setStatus('Rider cadastrado!');
        document.getElementById('rider-form').reset();
        loadRiders();
      })
      .catch(function () {
        log('<span class="muted">[erro] falha ao cadastrar rider</span>');
        setStatus('Erro ao cadastrar rider.');
      });
  });

  loadRiders();
})();
</script>
</body>
</html>
`;

# Deploy na Oracle Cloud (Always Free)

Guia passo a passo pra colocar a stack inteira no ar numa VM Ampere A1 (ARM) gratuita, e deixar o deploy automatizado via GitHub Actions.

> **Nota:** neste caso a instância Ampere A1 já existia e já roda outro app (não é uma VM dedicada só pra este projeto). Os passos 1 e 3 originais (criar instância, instalar Docker) foram substituídos por "reaproveitar a instância existente" — o restante do guia vale igual. A pasta do projeto na VM é `~/uber-services` (não `~/app`), e todo comando `docker compose` usa `-p uber-services` pra isolar essa stack de qualquer outra que já rode na máquina.

## 0. Antes de começar

Gere **um único par de chaves SSH** — ele vai servir tanto pra você acessar a VM quanto pro GitHub Actions fazer o deploy automático:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/oracle-uber-deploy -C "deploy-uber-services"
```

Isso cria `~/.ssh/oracle-uber-deploy` (privada) e `~/.ssh/oracle-uber-deploy.pub` (pública). Guarde as duas — a pública você usa na criação da VM, a privada vai virar secret do GitHub no passo 6.

## 1. Reaproveitar a instância existente

Já existe uma instância Ampere A1 rodando (com outro app junto — não é dedicada). Em vez de criar uma nova:

1. Confirme que sobra memória/disco pra mais uma stack (`free -h` e `df -h /` na VM).
2. Confirme quais portas já estão em uso (`docker ps`) — nossa stack só precisa da porta `3010` livre no host; o resto (Postgres, Mongo, RabbitMQ) fica só na rede interna do Docker, sem publicar porta.
3. Autorize a nova chave de deploy na instância — conecte com a chave que você **já usa** nela hoje e adicione a chave pública gerada no passo 0:
   ```bash
   ssh -i <sua-chave-atual> ubuntu@<IP_DA_VM> \
     "echo '$(cat ~/.ssh/oracle-uber-deploy.pub)' >> ~/.ssh/authorized_keys"
   ```
   Depois disso, `ssh -i ~/.ssh/oracle-uber-deploy ubuntu@<IP_DA_VM>` já funciona.

Não pare, reinicie ou redimensione essa instância — outro app depende dela.

## 2. Abrir a porta (duas camadas de firewall)

**a) Security List da VCN** (nível Oracle Cloud): Networking → Virtual Cloud Networks → sua VCN → Security Lists → Add Ingress Rule:
- Source CIDR: `0.0.0.0/0`
- Destination Port: `3010` (a porta do api-gateway)
- Também precisa da porta `22` (SSH) se ainda não estiver aberta.

**b) Firewall do próprio Ubuntu**: normalmente vem sem bloqueio ativo, mas confira:
```bash
sudo iptables -L
sudo ufw status
```
Se houver regra bloqueando, libere a porta 3010 (`sudo ufw allow 3010/tcp` se o ufw estiver ativo).

## 3. Conectar (Docker já está instalado nessa instância)

```bash
ssh -i ~/.ssh/oracle-uber-deploy ubuntu@<IP_DA_VM>
```

## 4. Clonar o repositório

```bash
git clone <URL_DO_SEU_REPO> ~/uber-services
cd ~/uber-services
```

## 5. Criar o `.env` (não vai pro git)

```bash
echo "JWT_SECRET=$(openssl rand -hex 32)" > ~/uber-services/.env
```

Esse arquivo fica só na VM e não é sobrescrito por `git pull` (está no `.gitignore`).

## 6. Primeiro deploy manual

```bash
cd ~/uber-services
docker compose -p uber-services -f docker-compose.prod.yml up -d --build
```

O `-p uber-services` nomeia essa stack como um projeto Compose separado, isolado de qualquer outro conjunto de containers que já rode na mesma máquina. Isso builda as 4 imagens (api-gateway, authentications, rider, logging) e sobe tudo junto com Mongo/RabbitMQ/Postgres x2 — nenhum deles publica porta no host, só o `api-gateway` fica acessível de fora, na porta 3010.

Teste de fora da VM:
```bash
curl http://<IP_DA_VM>:3010/health
```

> Nota: o `rider` usa TypeORM, que tenta conectar no Postgres na subida e só desiste depois de ~10 tentativas (30s). Se ele reiniciar sozinho uma ou duas vezes logo no primeiro `up`, é esperado — o `restart: always` do compose cuida disso.

## 7. Automatizar o deploy (GitHub Actions)

O workflow já está pronto em [.github/workflows/deploy.yml](.github/workflows/deploy.yml). Falta só cadastrar os secrets no repositório: **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Valor |
|---|---|
| `SSH_PRIVATE_KEY` | conteúdo do arquivo `~/.ssh/oracle-uber-deploy` (a privada, do passo 0) |
| `VM_HOST` | o IP público da VM |
| `VM_USER` | `ubuntu` |

Depois disso, todo `git push` na `main` faz o GitHub entrar na VM, dar `git pull` e reconstruir os containers automaticamente. Acompanhe em **Actions** na aba do repositório.

## 8. Checklist rápido

- [ ] Memória/disco conferidos na instância existente (`free -h`, `df -h /`)
- [ ] Chave de deploy autorizada em `~/.ssh/authorized_keys` da instância
- [ ] Porta 3010 liberada na Security List e no firewall do SO
- [ ] Repo clonado em `~/uber-services`
- [ ] `.env` criado na VM com `JWT_SECRET`
- [ ] Primeiro `docker compose -p uber-services up -d --build` rodado manualmente e `/health` respondendo
- [ ] 3 secrets cadastrados no GitHub
- [ ] Push de teste na `main` disparou o workflow com sucesso

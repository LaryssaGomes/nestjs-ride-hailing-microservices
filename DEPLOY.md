# Deploy na Oracle Cloud (Always Free)

Guia passo a passo pra colocar a stack inteira no ar numa VM Ampere A1 (ARM) gratuita, e deixar o deploy automatizado via GitHub Actions.

## 0. Antes de começar

Gere **um único par de chaves SSH** — ele vai servir tanto pra você acessar a VM quanto pro GitHub Actions fazer o deploy automático:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/oracle-uber-deploy -C "deploy-uber-services"
```

Isso cria `~/.ssh/oracle-uber-deploy` (privada) e `~/.ssh/oracle-uber-deploy.pub` (pública). Guarde as duas — a pública você usa na criação da VM, a privada vai virar secret do GitHub no passo 6.

## 1. Criar a instância na Oracle Cloud

1. Crie a conta em [cloud.oracle.com](https://cloud.oracle.com) (pede cartão pra verificação de identidade, mas nada é cobrado dentro do Always Free).
2. **Compute → Instances → Create Instance**.
3. Shape: **VM.Standard.A1.Flex**, 2 OCPU / 12 GB (o teto atual do Always Free — a Oracle cortou pela metade em jun/2026, antes era 4 OCPU/24GB).
4. Imagem: **Ubuntu 24.04** (evita as regras de firewall padrão mais restritivas de imagens Oracle Linux).
5. Em "Add SSH keys", cole o conteúdo de `oracle-uber-deploy.pub`.
6. Anote o **IP público** da instância quando ela subir.

Se der erro de "Out of host capacity" no shape Ampere: tente outro Availability Domain, ou tente de novo mais tarde — é um problema conhecido de disponibilidade regional, não é erro seu.

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

## 3. Conectar e instalar o Docker

```bash
ssh -i ~/.ssh/oracle-uber-deploy ubuntu@<IP_DA_VM>
```

Na VM:
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# saia e reconecte pra aplicar o grupo docker (evita precisar de sudo em todo comando)
exit
```

## 4. Clonar o repositório

Reconecte (`ssh -i ~/.ssh/oracle-uber-deploy ubuntu@<IP_DA_VM>`) e:

```bash
git clone <URL_DO_SEU_REPO> ~/app
cd ~/app
```

## 5. Criar o `.env` (não vai pro git)

```bash
echo "JWT_SECRET=$(openssl rand -hex 32)" > ~/app/.env
```

Esse arquivo fica só na VM e não é sobrescrito por `git pull` (está no `.gitignore`).

## 6. Primeiro deploy manual

```bash
cd ~/app
docker compose -f docker-compose.prod.yml up -d --build
```

Isso builda as 4 imagens (api-gateway, authentications, rider, logging) e sobe tudo junto com Mongo/RabbitMQ/Postgres x2. Só o `api-gateway` fica acessível de fora, na porta 3010.

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

- [ ] VM criada (2 OCPU / 12GB, Ubuntu 24.04 ARM64)
- [ ] Porta 3010 liberada na Security List e no firewall do SO
- [ ] Docker instalado na VM
- [ ] Repo clonado em `~/app`
- [ ] `.env` criado na VM com `JWT_SECRET`
- [ ] Primeiro `docker compose up -d --build` rodado manualmente e `/health` respondendo
- [ ] 3 secrets cadastrados no GitHub
- [ ] Push de teste na `main` disparou o workflow com sucesso

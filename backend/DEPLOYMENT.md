# Production Deployment

This project is deployed as one Docker Compose stack:

- Caddy serves the built frontend from `../frontend/dist`.
- Caddy proxies `/api/*` to the Spring Boot backend.
- MySQL stores production data in the `mysql_data` Docker volume.
- Caddy manages HTTPS certificates for `travelranchi.com` and `www.travelranchi.com`.

## Local Production-Style Run

From the frontend folder:

```sh
npm install
npm run build
```

From this backend folder:

```sh
cp .env.prod.example .env.prod
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f
```

Open:

- `http://localhost`
- `http://localhost/api/public/routes/search?origin=Mumbai&destination=Pune&date=2026-05-17`

## Server Setup

On a fresh Ubuntu server:

```sh
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
```

Log out and back in after adding the `ubuntu` user to the Docker group.

## Production Run

Copy this repository onto the server:

```text
/home/ubuntu/travelranchi
```

Build the frontend:

```sh
cd /home/ubuntu/travelranchi/frontend
npm install
npm run build
```

Create production secrets:

```sh
cd /home/ubuntu/travelranchi/backend
cp .env.prod.example .env.prod
nano .env.prod
```

Use strong unique values for:

- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `SPRING_DATASOURCE_PASSWORD` - same value as `MYSQL_PASSWORD`
- `APP_JWT_SECRET`

### WhatsApp Ticket Notifications

WhatsApp ticket confirmations are feature-flagged and disabled by default.

To keep the service off:

```sh
APP_WHATSAPP_ENABLED=false
```

To enable Gupshup WhatsApp API after the business phone number and template are approved:

```sh
APP_WHATSAPP_ENABLED=true
APP_WHATSAPP_GUPSHUP_API_KEY=<gupshup-api-key>
APP_WHATSAPP_GUPSHUP_SOURCE_NUMBER=<registered-whatsapp-source-number>
APP_WHATSAPP_GUPSHUP_APP_NAME=<gupshup-app-name>
APP_WHATSAPP_MESSAGE_MODE=TEMPLATE
APP_WHATSAPP_TICKET_CONFIRMATION_TEMPLATE_ID=<gupshup-template-id>
APP_WHATSAPP_TICKET_CONFIRMATION_LANGUAGE_CODE=en
APP_WHATSAPP_TICKET_CONFIRMATION_TEMPLATE_PARAMS=passengerName,bookingReference,route,travelDate,departureTime,seatLabels,ticketUrl
APP_WHATSAPP_TICKET_BASE_URL=https://travelranchi.com
```

`APP_WHATSAPP_MESSAGE_MODE` supports:

- `TEMPLATE` - sends an approved WhatsApp template. Use this for production booking confirmations.
- `TEXT` - sends a free-form text message, useful for testing inside WhatsApp's customer-service window.

Supported template placeholders:

- `passengerName`
- `bookingReference`
- `route`
- `travelDate`
- `departureTime`
- `seatLabels`
- `ticketUrl`

The feature is fail-soft: if WhatsApp is disabled, misconfigured, or temporarily down, the booking still succeeds and the failure is logged.

Gupshup API details used by the app:

- Template endpoint: `https://api.gupshup.io/wa/api/v1/template/msg`
- Text/session endpoint: `https://api.gupshup.io/wa/api/v1/msg`
- Auth header: `apikey`
- Request format: `application/x-www-form-urlencoded`

Start the stack:

```sh
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f
```

## DNS

In GoDaddy DNS for `travelranchi.com`:

- `A` record, name `@`, value `<EC2_ELASTIC_IP>`
- `CNAME` record, name `www`, value `travelranchi.com`

After DNS points to the server, Caddy will request HTTPS certificates automatically.

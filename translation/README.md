# DeshConnect LibreTranslate server

This is the self-hosted, open-source translation service used by DeshConnect. It loads only Bengali and English models.

## Requirements

- A Linux server/VM with Docker Engine and Docker Compose.
- Enough memory and disk for LibreTranslate and the Argos Bengali/English models.
- A public HTTPS hostname with a reverse proxy (Caddy or Nginx). Do not expose port 5000 directly to the public internet.

The LibreTranslate software and Argos models are open-source. Compute/hosting is free only if your server provider/VM is free; this repository cannot guarantee a free always-on server.

## Start

From this directory:

```bash
docker compose up -d
docker compose logs -f libretranslate
```

The first start downloads the English/Bengali language models and can take several minutes. Models are persisted in a Docker volume.

## Create an API key

After the container is running:

```bash
docker compose exec libretranslate ltmanage keys add 120 --char-limit 5000
```

Copy the generated key and store it as `LIBRETRANSLATE_API_KEY` in Vercel. Do not commit it to GitHub.

## Connect to Vercel

Configure these project environment variables in Vercel for Production, Preview, and Development:

- `LIBRETRANSLATE_URL`: your HTTPS translation server origin, e.g. `https://translate.example.com` (do not append `/translate`)
- `LIBRETRANSLATE_API_KEY`: the key generated above

Then redeploy the Next.js project.

## Verify the server

From the translation host itself:

```bash
curl http://127.0.0.1:5000/languages
```

Test English to Bengali:

```bash
curl -X POST http://127.0.0.1:5000/translate \
  -H "Content-Type: application/json" \
  -d '{"q":["Hello world"],"source":"en","target":"bn","format":"text"}'
```

Test Bengali to English:

```bash
curl -X POST http://127.0.0.1:5000/translate \
  -H "Content-Type: application/json" \
  -d '{"q":["আমি বাংলাদেশকে ভালোবাসি"],"source":"bn","target":"en","format":"text"}'
```

## Security notes

- Keep port 5000 bound to localhost and publish it only through HTTPS reverse proxy.
- Keep the API key only in Vercel's server-side environment variables.
- Keep request, batch, and character limits enabled.
- Never use this endpoint to translate private chat/conversation content. DeshConnect's frontend excludes those elements from page translation.

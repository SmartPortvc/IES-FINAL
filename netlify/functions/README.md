# IES Vessel API (Netlify Functions)

This API has been migrated to Netlify Functions for serverless deployment.

## Endpoint
`https://your-site.netlify.app/.netlify/functions/getVessels`

## Authentication
Requires an `X-API-Key` header.
- **Key**: `ies_vessel_secret_2024` (Or as configured in Netlify UI Environment Variables)

## Deployment Note
Ensure the following Environment Variables are set in your **Netlify Dashboard** (Site settings > Environment variables):
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `API_KEY` (The secret key for authentication)

## Local Development
Run Netlify CLI to test functions locally:
```bash
netlify dev
```

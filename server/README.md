# IES Vessel Integration API

This is a secure API designed to export vessel data from the IES Portal to external systems.

## Features
- **Secure Access**: Protected by API Key authentication via `X-API-Key` header.
- **Full Data Export**: Returns all vessel details stored in the system.
- **Easy Integration**: Standalone Node.js server that connects directly to the project's Firestore.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment**:
   - The `.env` file is already pre-configured with the current project's Firebase credentials.
   - **IMPORTANT**: Change the `API_KEY` in `.env` to a strong, unique secret before deploying.

3. **Start the Server**:
   ```bash
   npm start
   ```
   *Note: You can use `node index.js` if you haven't added a start script yet, or use `nodemon` for development.*

## Documentation

### GET /api/vessels

**Headers**:
- `X-API-Key`: Your secret API key (defined in `.env`)

**Response Format**:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "vessel_document_id",
      "vesselName": "Example Vessel",
      "imo": "1234567",
      ...
    }
  ]
}
```

## Security Recommendations
- Always use HTTPS in production.
- Regularly rotate the `API_KEY`.
- For more advanced security, consider implementing JWT or OAuth2 if the external system supports it.

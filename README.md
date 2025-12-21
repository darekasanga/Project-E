# Project-E

## Articles persistence

Articles API data is stored in a configurable location. Set the `ARTICLES_DATA_PATH` environment variable to point to a writable, persistent path (for example, a mounted volume or external storage location). 

**Default behavior:**
- If `ARTICLES_DATA_PATH` is not set, the API writes to `/tmp/articles-data.json`
- On Vercel's serverless runtime, `/tmp` is the only writable directory, but data is ephemeral and lost between deployments
- For persistent storage on Vercel, configure `ARTICLES_DATA_PATH` to point to a mounted volume or external file storage location
- For local development with persistent storage, set `ARTICLES_DATA_PATH` to a local directory (e.g., `./data/articles-data.json`)

### Runtime requirements

- Deployments assume a Node.js 18 runtime (see `vercel.json`).
- For local development, install Node.js 18 or higher (for example via `nvm install 18 && nvm use 18`) before running the API routes so they match the deployment environment.

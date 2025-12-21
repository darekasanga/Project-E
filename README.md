# Project-E

## Articles persistence

Articles API data is now stored in a configurable, durable location instead of the temporary `/tmp` directory. Set the `ARTICLES_DATA_PATH` environment variable to point to a writable, persistent path (for example, a mounted volume or external storage location). If the variable is unset, the API writes to `./data/articles-data.json` and will create the directory if it does not exist. Ensure your deployment target provides a persistent file system or configure `ARTICLES_DATA_PATH` accordingly.

### Runtime requirements

- Deployments assume a Node.js 18 runtime (see `vercel.json`).
- For local development, install Node.js 18 or higher (for example via `nvm install 18 && nvm use 18`) before running the API routes so they match the deployment environment.

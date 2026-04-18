/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional absolute base for API (e.g. deployed FastAPI). If unset, `/api/*` uses Vite dev proxy. */
  readonly VITE_API_URL?: string;
}

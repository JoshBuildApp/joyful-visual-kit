declare module 'cloudflare:workers' {
  export const env: {
    SITE: {
      get: (key: string, type: 'json') => Promise<unknown>
      put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>
      delete: (key: string) => Promise<void>
    }
    MEDIA: {
      put: (key: string, value: ArrayBuffer | ReadableStream, options?: { httpMetadata?: { contentType?: string } }) => Promise<unknown>
      get: (key: string, options?: { range?: { offset: number; length?: number } }) => Promise<{ body: ReadableStream; size: number; httpMetadata?: { contentType?: string } } | null>
      head: (key: string) => Promise<{ size: number; httpMetadata?: { contentType?: string } } | null>
    }
    ADMIN_PASSWORD?: string
    SESSION_SECRET?: string
  }
}

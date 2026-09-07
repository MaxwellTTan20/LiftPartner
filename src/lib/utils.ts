/**
 * Races a promise against a timeout so a stuck Firebase call (bad security
 * rules, Storage not enabled, network/CORS issues) fails loudly instead of
 * hanging the UI forever.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} took too long (over ${Math.round(ms / 1000)}s). Check your network connection and Firebase console setup.`)), ms)
    }),
  ])
}

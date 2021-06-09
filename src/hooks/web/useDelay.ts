export const useDelay = (t: number = 1000) => new Promise<void>((r) => setTimeout(r, t));

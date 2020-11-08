
let instance: object;

export function initInstance (input: object) {
  if (!instance) {
    instance = input;
  }
}

export function useGlobalProps () {
  return instance;
}
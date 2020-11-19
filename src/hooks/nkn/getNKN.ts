const getGlobal = (): any => (typeof window !== 'undefined' ? window : global);

export function getNKN() {
  return new Promise((resolve) => {
    setInterval(() => {
      const global = getGlobal();
      if (global && global.nkn) {
        resolve(global.nkn);
      }
    }, 100);
  });
}

export function getCrypto() {
  return new Promise((resolve) => {
    setInterval(() => {
      const global = getGlobal();
      if (global && global.CryptoJS) {
        resolve(global.CryptoJS);
      }
    }, 100);
  });
}

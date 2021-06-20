/** 延迟函数,默认1000毫秒(1秒) */
export const useDelay = (t = 1000): Promise<void> => {
  return new Promise<void>((r) => setTimeout(r, t));
};

/** svg logo 白底图 */
export const useSvgWhiteLogo = (width = 22.1, height = 24.8): string => {
  return `<svg width="${width}" height="${height}"><path fill="#fff" d="M9.8 24.4l-8.6-4.9C.5 19.1 0 18.2 0 17.3V7.4c0-.9.5-1.7 1.3-2.2L9.9.3c.8-.4 1.7-.4 2.5 0L21 5.2c.8.4 1.3 1.3 1.3 2.2v9.9c0 .9-.5 1.7-1.3 2.2l-8.6 4.9c-.9.5-1.8.5-2.6 0z"/><circle fill="#423d3d" cx="11.06" cy="12.4" r="9"/><circle fill="#231f20" cx="11.06" cy="12.4" r="6"/><path stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" stroke-linejoin="round" d="M9.33 13.4l1.73-1 1.73 1m-1.73-1v-2"/><circle fill="#423d3d" cx="11.06" cy="12.4" r="2"/></svg>`;
};

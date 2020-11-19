/**
 * 字节转换函数
 * @param {number} byte
 */
export function byteTransfer(byte: number) {
  if (byte === 0) {
    return '';
  }
  const k: number = 1024;

  const sizes = ['B', 'K', 'M', 'G', 'T'];

  let i: number = 0;

  let byteTransfered;

  if (byte === 0) {
    i = 0;
  } else {
    i = Math.floor(Math.log(byte) / Math.log(k));
  }

  byteTransfered = (byte / Math.pow(k, i)).toFixed(1) + sizes[i];

  return byteTransfered;
}

/**
 * 字节转换函数
 * @param {number} byte
 */
export function byteTransfer(byte: number): { value: string; unit: string } {
  if (byte === 0) {
    return { value: '0', unit: 'B' };
  }
  const k: number = 1024;

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  let i: number = 0;
  if (byte === 0) {
    i = 0;
  } else {
    i = Math.floor(Math.log(byte) / Math.log(k));
  }

  return { value: (byte / Math.pow(k, i)).toFixed(1), unit: sizes[i] };
}

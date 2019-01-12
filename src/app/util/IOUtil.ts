
export function toUint8Array(buf: Buffer) {
  const ab = new ArrayBuffer(buf.length);
  const array = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    array[i] = buf[i];
  }
  return array;
}

export function toBuffer(array: Uint8Array) {
  const buf = Buffer.alloc(array.byteLength);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = array[i];
  }
  return buf;
}
declare module "node-web-streams" {
  export function toWebReadableStream(ReadableStream): ReadableStream;
  export function ReadableStream(): ReadableStream;
}
declare module "filereader-stream" {
  export default function fileReaderStream(file: File): ReadableStream;
}

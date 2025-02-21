export type FileT = {
  originalFileName: string;
  fileSize: number;
};

export type PresignedUrlT = FileT & {
  url: string;
  fileNameInBucket: string;
};
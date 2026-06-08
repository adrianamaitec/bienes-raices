// lib/r2Client.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadToR2 = async (file: File, folder: string = '') => {
  const ext = file.name.split('.').pop();
  const key = `${folder}${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const body = new Uint8Array(arrayBuffer);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_R2_BUCKET!,
      Key: key,
      Body: body,
      ContentType: file.type,
    })
  );

  // URL pública (si tienes el bucket público)
  return `${process.env.R2_ENDPOINT}/${process.env.NEXT_PUBLIC_R2_BUCKET}/${key}`;
};

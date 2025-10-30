import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const departmentId = formData.get('departmentId') as string;

    if (!file || !departmentId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const ext = file.name.split('.').pop();
    const key = `departments/${departmentId}/${Date.now()}-${file.name}`;
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

    const publicUrl = `${process.env.R2_ENDPOINT}/${process.env.NEXT_PUBLIC_R2_BUCKET}/${key}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('❌ Error subiendo modelo 3D:', error);
    return NextResponse.json({ error: 'Error interno al subir el modelo' }, { status: 500 });
  }
}

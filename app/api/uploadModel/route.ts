// app/api/uploadModel/route.ts
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

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

    console.log(`📤 Procesando modelo 3D para departamento ${departmentId}`);

    // 🔹 PRIMERO: Limpiar TODOS los archivos existentes en la carpeta del departamento
    const folderPrefix = `departments/${departmentId}/`;
    
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.NEXT_PUBLIC_R2_BUCKET!,
        Prefix: folderPrefix,
      });

      const listedObjects = await r2Client.send(listCommand);
      
      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        console.log(`🗑️ Eliminando ${listedObjects.Contents.length} archivos existentes en ${folderPrefix}`);
        
        const deletePromises = listedObjects.Contents.map(async (object) => {
          if (object.Key) {
            await r2Client.send(
              new DeleteObjectCommand({
                Bucket: process.env.NEXT_PUBLIC_R2_BUCKET!,
                Key: object.Key,
              })
            );
            console.log(`✅ Eliminado: ${object.Key}`);
          }
        });

        await Promise.all(deletePromises);
        console.log(`✅ Carpeta limpiada completamente`);
      }
    } catch (cleanupError) {
      console.warn('⚠️ No se pudieron eliminar archivos existentes, continuando...', cleanupError);
    }

    // 🔹 SUBIR nuevo archivo (ahora la carpeta está vacía)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `model-${timestamp}-${randomString}.${file.name.split('.').pop()}`;
    const key = `departments/${departmentId}/${fileName}`;

    console.log(`📤 Subiendo nuevo modelo 3D: ${key}`);

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

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
    
    console.log(`✅ Modelo subido exitosamente: ${publicUrl}`);

    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      key: key
    });
  } catch (error: any) {
    console.error('❌ Error subiendo modelo 3D:', error);
    return NextResponse.json({ 
      error: 'Error interno al subir el modelo',
      details: error.message 
    }, { status: 500 });
  }
}
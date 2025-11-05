// app/api/deleteModel/route.ts
import { NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

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
    const { fileKeys, cleanFolder } = await req.json();

    if (cleanFolder && fileKeys && fileKeys.length > 0) {
      // 🔹 LIMPIAR CARPETA COMPLETA
      const folderPrefix = fileKeys[0]; // departments/12
      
      console.log(`🧹 Limpiando carpeta completa: ${folderPrefix}`);
      
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.NEXT_PUBLIC_R2_BUCKET!,
        Prefix: folderPrefix,
      });

      const listedObjects = await r2Client.send(listCommand);
      
      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        console.log(`🗑️ Eliminando ${listedObjects.Contents.length} archivos de ${folderPrefix}`);
        
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
        
        return NextResponse.json({ 
          success: true,
          message: `Eliminados ${listedObjects.Contents.length} archivos de la carpeta`
        });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Carpeta ya estaba vacía'
      });
    }

    // 🔹 ELIMINACIÓN NORMAL de archivos específicos
    if (!fileKeys || !Array.isArray(fileKeys)) {
      return NextResponse.json({ error: 'File keys requeridas' }, { status: 400 });
    }

    console.log(`🗑️ Eliminando archivos específicos de R2:`, fileKeys);

    const deletePromises = fileKeys.map(async (key: string) => {
      try {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_R2_BUCKET!,
            Key: key,
          })
        );
        console.log(`✅ Archivo eliminado: ${key}`);
      } catch (error) {
        console.error(`❌ Error eliminando ${key}:`, error);
      }
    });

    await Promise.all(deletePromises);

    return NextResponse.json({ 
      success: true,
      message: `Eliminados ${fileKeys.length} archivos`
    });
  } catch (error: any) {
    console.error('❌ Error eliminando modelos:', error);
    return NextResponse.json({ 
      error: 'Error interno al eliminar modelos',
      details: error.message 
    }, { status: 500 });
  }
}
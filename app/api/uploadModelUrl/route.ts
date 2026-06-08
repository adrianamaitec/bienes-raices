// app/api/uploadModelUrl/route.ts

import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const { departmentId, fileName, contentType } = await req.json();

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);

    const extension = fileName.split(".").pop();

    const key = `departments/${departmentId}/model-${timestamp}-${randomString}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_R2_BUCKET!,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2Client as any, command, {
      expiresIn: 300,
    });

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

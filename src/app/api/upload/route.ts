// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// 从环境变量获取配置，并增加校验
const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL;
const MINIO_BUCKET = process.env.NEXT_PUBLIC_MINIO_BUCKET;
const MINIO_ACCESS_KEY = process.env.NEXT_PUBLIC_MINIO_ACCESS_KEY;
const MINIO_SECRET_KEY = process.env.NEXT_PUBLIC_MINIO_SECRET_KEY;
// 校验必要的环境变量
if (!MINIO_URL || !MINIO_BUCKET || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
    throw new Error('请配置完整的MinIO环境变量（MINIO_URL、MINIO_BUCKET、MINIO_ACCESS_KEY、MINIO_SECRET_KEY）');
}

// 初始化MinIO客户端
const s3Client = new S3Client({
    endpoint: MINIO_URL,
    region: 'us-east-1',
    credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: '未找到文件' }, { status: 400 });
        }

        // 生成唯一文件名
        const fileExt = file.name.split('.').pop() || '';
        const fileName = `${uuidv4()}.${fileExt}`;

        // 读取文件内容
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 上传到MinIO（确保Bucket参数正确）
        await s3Client.send(new PutObjectCommand({
            Bucket: MINIO_BUCKET, // 直接使用已校验的变量
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
        }));

        // 生成访问URL（注意MinIO的URL格式是否需要调整）
        const fileUrl = `${MINIO_URL}/${MINIO_BUCKET}/${fileName}`;

        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error('上传错误:', error);
        return NextResponse.json(
            { error: '上传失败，请重试' },
            { status: 500 }
        );
    }
}
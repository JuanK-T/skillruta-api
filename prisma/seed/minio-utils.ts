import { minioClient, BUCKET_NAME, checkMinioConnection } from './minio-client';
import * as crypto from 'crypto';
import * as path from 'path';
import { faker } from '@faker-js/faker';
import { MediaKind } from '@prisma/client';

// Variable para cachear el estado de conexión
let minioAvailable: boolean | null = null;

// Verificar si MinIO está disponible
async function isMinioAvailable(): Promise<boolean> {
  if (minioAvailable === null) {
    minioAvailable = await checkMinioConnection();
  }
  return minioAvailable;
}

// Función para slugify
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Función para subir un buffer a MinIO con fallback
export async function uploadBufferToMinio(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{
  storageKey: string;
  sizeBytes: number;
  sha256: string;
  url: string;
}> {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);

  const storageKey = `seed/${baseName}-${timestamp}-${randomStr}${ext}`;
  const sizeBytes = buffer.length;
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

  // Verificar si MinIO está disponible
  if (!(await isMinioAvailable())) {
    console.warn('MinIO no disponible, usando URL de fallback');
    return {
      storageKey,
      sizeBytes,
      sha256,
      url: `https://placehold.co/600x400/png?text=${encodeURIComponent(baseName)}`,
    };
  }

  try {
    await minioClient.putObject(BUCKET_NAME, storageKey, buffer, sizeBytes, {
      'Content-Type': mimeType,
    });

    const url = await minioClient.presignedGetObject(
      BUCKET_NAME,
      storageKey,
      24 * 60 * 60
    );

    return { storageKey, sizeBytes, sha256, url };
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    // Fallback a URL de placeholder
    return {
      storageKey,
      sizeBytes,
      sha256,
      url: `https://placehold.co/600x400/png?text=${encodeURIComponent(baseName)}`,
    };
  }
}

// Función para obtener una URL firmada de MinIO con fallback
export async function getPresignedUrl(
  storageKey: string,
  fallbackName: string = 'file'
): Promise<string> {
  if (!(await isMinioAvailable())) {
    return `https://placehold.co/600x400/png?text=${encodeURIComponent(fallbackName)}`;
  }

  try {
    return await minioClient.presignedGetObject(
      BUCKET_NAME,
      storageKey,
      24 * 60 * 60
    );
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    return `https://placehold.co/600x400/png?text=${encodeURIComponent(fallbackName)}`;
  }
}

// Función para generar contenido de archivo simulado
// eslint-disable-next-line @typescript-eslint/require-await
export async function generateFileContent(
  kind: MediaKind,
  title: string
): Promise<{
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}> {
  const extMap = {
    [MediaKind.IMAGE]: { ext: '.jpg', mime: 'image/jpeg' },
    [MediaKind.VIDEO]: { ext: '.mp4', mime: 'video/mp4' },
    [MediaKind.AUDIO]: { ext: '.mp3', mime: 'audio/mpeg' },
    [MediaKind.DOCUMENT]: { ext: '.pdf', mime: 'application/pdf' },
    [MediaKind.OTHER]: { ext: '.bin', mime: 'application/octet-stream' },
  };

  const { ext, mime } = extMap[kind] || {
    ext: '.bin',
    mime: 'application/octet-stream',
  };
  const originalName = `${slugify(title)}${ext}`;

  // Generar contenido simulado más realista
  let content = '';
  if (kind === MediaKind.IMAGE) {
    content = `Simulated image: ${title}`;
  } else if (kind === MediaKind.VIDEO) {
    content = `Simulated video: ${title}`;
  } else if (kind === MediaKind.DOCUMENT) {
    content = `Simulated PDF: ${title}\n\n${faker.lorem.paragraphs(3)}`;
  } else {
    content = `Simulated ${kind} file: ${title}`;
  }

  const buffer = Buffer.from(content);

  return { buffer, mimeType: mime, originalName };
}

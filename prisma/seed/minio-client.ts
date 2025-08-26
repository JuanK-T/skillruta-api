import * as MinIO from 'minio';

// Configuración mejorada del cliente MinIO
function createMinioClient() {
  try {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost:9000';
    const useSSL = process.env.MINIO_USE_SSL === 'true';

    // Parsear el endpoint para extraer host y puerto
    let host = endpoint;
    let port = 9000;

    if (endpoint.includes('://')) {
      const url = new URL(endpoint);
      host = url.hostname;
      port = url.port ? parseInt(url.port) : useSSL ? 443 : 80;
    } else if (endpoint.includes(':')) {
      const parts = endpoint.split(':');
      host = parts[0];
      port = parseInt(parts[1]);
    }

    return new MinIO.Client({
      endPoint: host,
      port: port,
      useSSL: useSSL,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    });
  } catch (error) {
    console.error('Error creating MinIO client:', error);
    throw error;
  }
}

export const minioClient = createMinioClient();
export const BUCKET_NAME = process.env.MINIO_BUCKET || 'uploads';

// Función para verificar la conexión a MinIO
export async function checkMinioConnection(): Promise<boolean> {
  try {
    await minioClient.listBuckets();
    return true;
  } catch (error) {
    console.warn('MinIO connection failed:', error);
    return false;
  }
}

// Función mejorada para asegurar que el bucket existe
export async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      console.log(`Bucket ${BUCKET_NAME} does not exist, creating...`);
      await minioClient.makeBucket(
        BUCKET_NAME,
        process.env.MINIO_REGION || 'us-east-1'
      );

      // Establecer política de acceso público para el bucket (opcional, solo para desarrollo)
      try {
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
            },
          ],
        };
        await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
        console.log(`Bucket policy set for ${BUCKET_NAME}`);
      } catch (policyError) {
        console.warn(`Could not set bucket policy: ${policyError}`); // eslint-disable-line @typescript-eslint/restrict-template-expressions
      }

      console.log(`Bucket ${BUCKET_NAME} creado exitosamente.`);
    } else {
      console.log(`Bucket ${BUCKET_NAME} ya existe.`);
    }
    return true;
  } catch (error) {
    console.error(`Error ensuring bucket ${BUCKET_NAME}:`, error);

    // Verificar si el error es de conexión
    if (error === 'ENOTFOUND' || error === 'ECONNREFUSED') {
      console.warn('MinIO no está disponible. Usando modos de fallback.');
      return false;
    }

    throw error;
  }
}

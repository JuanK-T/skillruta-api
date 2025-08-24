import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@skillruta.dev';
  const password = 'Admin123!';

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log('✔ Admin ya existe:', email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'ADMIN',
      refreshTokenHash: null,
    },
  });

  console.log('✅ Admin creado:', email, '(pass: Admin123!)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(() => {}); // Catch vacío para manejar errores
  });

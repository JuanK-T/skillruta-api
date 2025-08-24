# SkillRuta API - Documentación del Proyecto

## 📋 Descripción del Proyecto

SkillRuta API es una aplicación backend desarrollada con NestJS que proporciona servicios para la gestión de cursos, capítulos, progreso de usuarios e insignias. Esta API está diseñada para ser escalable, mantenible y seguir las mejores prácticas de desarrollo.

## 🛠️ Tecnologías Utilizadas

### Backend

- **NestJS** - Framework principal de Node.js
- **TypeScript** - Lenguaje de programación
- **Prisma** - ORM para la base de datos
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación por tokens
- **Passport** - Estrategias de autenticación
- **Class Validator** - Validación de DTOs
- **Swagger/OpenAPI** - Documentación de la API

### Desarrollo y Calidad de Código

- **ESLint** - Linter para análisis estático
- **Prettier** - Formateo de código
- **Husky** - Git hooks
- **Commitizen** - Commits convencionales
- **Commitlint** - Validación de mensajes de commit
- **Jest** - Framework de testing

## 🚀 Configuración y Ejecución

### Prerrequisitos

- Node.js (v18 o superior)
- Docker y Docker Compose
- npm o yarn

### Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repositorio>
   cd skillruta-api
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   # Copiar y ajustar el archivo .env según sea necesario
   cp .env.example .env
   ```

4. **Iniciar servicios con Docker**

   ```bash
   # Iniciar MySQL y Adminer
   docker-compose up -d
   ```

5. **Configurar la base de datos**

   ```bash
   # Generar el cliente de Prisma
   npm run prisma:generate

   # Ejecutar migraciones para crear las tablas
   npm run prisma:migrate

   # Opcional: Ejecutar seeder con datos de prueba
   npm run seed
   ```

6. **Ejecutar la aplicación**

   ```bash
   # Modo desarrollo
   npm run start:dev

   # Modo producción
   npm run start
   ```

## 📖 Acceso a Swagger/OpenAPI

Una vez que la aplicación esté ejecutándose, puedes acceder a la documentación interactiva de la API en:

```
http://localhost:3000/docs
```

**Nota importante**: La autenticación en Swagger se maneja mediante cookies HTTP-only. Después de iniciar sesión mediante el endpoint correspondiente, el token JWT se almacenará automáticamente en una cookie y se enviará con las solicitudes subsiguientes.

## 🗃️ Base de Datos

### Configuración de Prisma

El proyecto utiliza Prisma ORM para la gestión de la base de datos. El esquema se define en prisma/schema.prisma e incluye modelos para usuarios, cursos, capítulos, progreso e insignias.

### Estructura de la Base de Datos

La aplicación utiliza MySQL 8.0 con las siguientes configuraciones:

- Puerto mapeado: 3307 (externo) → 3306 (contenedor)
- Nombre de la base de datos: `skillruta`
- Usuario: `skilluser`
- Contraseña: `skillpass`

### Acceso a Adminer

Puedes gestionar la base de datos visualmente mediante Adminer en:

```
http://localhost:8080
```

- Sistema: MySQL
- Servidor: `mysql`
- Usuario: `skilluser` (o `root` para acceso completo)
- Contraseña: `skillpass` (o `rootpass` para root)
- Base de datos: `skillruta`

## 🔐 Autenticación y Autorización

La API utiliza autenticación JWT con las siguientes características:

- Tokens almacenados en cookies HTTP-only para mayor seguridad
- Estrategia Passport-JWT para la validación de tokens
- Configuración flexible mediante variables de entorno

## 📝 Conventional Commits

Este proyecto sigue el estándar de Conventional Commits para mantener un historial de cambios claro y consistente.

### Formatos de commit:

```
<tipo>[ámbito opcional]: <descripción>

[cuerpo opcional]

[pie opcional]
```

### Tipos permitidos:

- `feat` - Nueva funcionalidad
- `fix` - Corrección de bugs
- `docs` - Cambios en documentación
- `style` - Cambios de formato (espacios, comas, etc.)
- `refactor` - Refactorización de código
- `test` - Adición o modificación de tests
- `chore` - Tareas de mantenimiento

### Ejemplos:

```bash
# Usando commitizen (recomendado)
npm run commit

# Manualmente (siguiendo el formato)
git commit -m "feat(users): add user registration endpoint"
git commit -m "fix(auth): resolve token expiration issue"
```

### Validación:

El proyecto utiliza Commitlint para validar que los mensajes de commit sigan el formato convencional. Los commits que no cumplan con el formato serán rechazados.

## 🧪 Testing

### Ejecutar tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Generar reporte de cobertura
npm test -- --coverage
```

## 🔧 Scripts Disponibles

| Comando                   | Descripción                                   |
| ------------------------- | --------------------------------------------- |
| `npm start`               | Ejecuta la aplicación en producción           |
| `npm run start:dev`       | Ejecuta en modo desarrollo con hot-reload     |
| `npm run lint`            | Ejecuta ESLint para análisis de código        |
| `npm run format`          | Formatea el código con Prettier               |
| `npm run check`           | Ejecuta format y lint                         |
| `npm run prisma:generate` | Genera cliente Prisma                         |
| `npm run prisma:migrate`  | Ejecuta migraciones de base de datos          |
| `npm run db:reset`        | Reinicia la base de datos                     |
| `npm run seed`            | Ejecuta seeder de base de datos               |
| `npm run commit`          | Inicia Commitizen para commits convencionales |
| `npx prisma studio`       | Inicia Commitizen para commits convencionales |

## 🌐 Estructura del Proyecto

```
src/
├── modules/          # Módulos de la aplicación
│   ├── auth/        # Autenticación y autorización
│   ├── users/       # Gestión de usuarios
│   ├── courses/     # Gestión de cursos
│   └── ...          # Otros módulos
├── common/          # Utilidades y recursos compartidos
├── config/          # Configuraciones de la aplicación
└── main.ts          # Punto de entrada de la aplicación
```

## ⚙️ Variables de Entorno

Las principales variables de entorno utilizadas son:

| Variable         | Descripción             | Valor por Defecto |
| ---------------- | ----------------------- | ----------------- |
| `APP_PORT`       | Puerto de la aplicación | 3000              |
| `NODE_ENV`       | Entorno de ejecución    | development       |
| `JWT_SECRET`     | Secreto para firmar JWT | default-secret    |
| `JWT_EXPIRES_IN` | Expiración de JWT       | 1d                |
| `DATABASE_URL`   | URL de conexión a BD    | -                 |
| `COOKIE_SECURE`  | Cookies seguras (HTTPS) | false             |

## 🤝 Contribución

1. Asegúrate de seguir el estándar de Conventional Commits
2. Ejecuta `npm run check` antes de commitear para verificar formato y linting
3. Mantén las pruebas actualizadas
4. Actualiza la documentación cuando sea necesario

## 📄 Licencia

Este proyecto es de uso privado y no tiene una licencia pública específica.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Datos

El dashboard consume el dataset [Resultados únicos Saber 11](https://www.datos.gov.co/Educaci%C3%B3n/Resultados-%C3%BAnicos-Saber-11/kgxf-xxbe) (`kgxf-xxbe`) de datos.gov.co.

- **El cálculo ocurre en el servidor.** `app/services/dataLoader.ts` pide con SoQL el promedio por año de cada área, ya redondeado (`GROUP BY substring(PERIODO,1,4)` + `round(avg(...), 2)`). La app no agrupa ni promedia registros: `app/services/chartData.ts` solo renombra campos y decide qué corte usa cada gráfico.
- **Cobertura:** las consultas recorren los ~7,1 millones de registros del dataset. Los gráficos usan los 4,5 millones que tienen puntaje global, es decir desde **2014-2** (antes el examen tenía otra escala y no existe `PUNT_GLOBAL`) hasta el último período publicado.
- **Peso en el navegador:** ~700 KB para todo el histórico, guardados en IndexedDB durante 12 horas. Cambiar de colegio o de año no vuelve a consultar la API.
- **Años disponibles:** no están escritos en el código; salen del propio dataset, así que cuando el ICFES publique un período nuevo (2023, 2024, 2025...) los deslizadores lo incluirán solos.
- **Último período publicado a la fecha: 2022-4.** El portal aún no tiene datos posteriores en este dataset.

## Docker

Levantar el dashboard con Docker Compose:

```bash
docker compose up -d --build
```

Queda disponible en [http://localhost:3000](http://localhost:3000). Para ver los logs o detenerlo:

```bash
docker compose logs -f
docker compose down
```

Variables opcionales: copia `.env.example` a `.env` para definir `DATA_GOV_TOKEN` (token de datos.gov.co) o `PORT` (puerto del host, por defecto 3000).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Codeverso

Una plataforma fullstack para practicar programacion en decenas de lenguajes, con un editor inteligente estilo VSCode, ejercicios aleatorios y seguimiento de tu progreso.

## Que incluye

- **Codear libremente**: elegi un lenguaje entre un catalogo enorme (mas de 180 lenguajes y variantes, entre populares, historicos, esotericos, cientificos y mas). El editor cambia automaticamente su tematica de colores, resaltado de sintaxis, indentacion (espacios o tabulaciones segun corresponda) y el comportamiento de autocompletado de simbolos segun el lenguaje elegido (por ejemplo, HTML autocompleta etiquetas de cierre, mientras que C++ o CSS autocompletan llaves y parentesis). La ayuda de indentacion y el autocierre de simbolos se pueden desactivar con un switch al lado del selector de lenguaje. Podes guardar tu codigo o guardarlo como uno nuevo, y todos tus codigos guardados quedan listados en la barra lateral para retomarlos cuando quieras.
- **Ejercicios aleatorios**: elegi lenguaje y dificultad (facil, media o dificil) y recibi un ejercicio al azar, con enunciado, tips, errores comunes y una pista de solucion. Algunos ejercicios son de practica libre y otros te piden arreglar un codigo que tiene un error. Podes skipear, pedir otro, subir o bajar la dificultad, marcar el ejercicio como resuelto, y guardar tus propios errores en tu registro personal.
- **Mi cuenta**: iniciando sesion se guarda todo tu progreso: tus codigos, tus ejercicios resueltos, tu racha de dias seguidos practicando, tus proyectos (los que estas haciendo y los que queres hacer), los lenguajes que te faltan aprender con su prioridad, y un registro de los errores que fuiste cometiendo para repasarlos.

## Stack tecnico

Node.js + Express + PostgreSQL + EJS. El editor de codigo, el resaltado de sintaxis y la logica de indentacion inteligente estan escritos en JavaScript puro (sin dependencias externas de frontend).

## Como correrlo en local

1. Instala las dependencias:
   ```
   npm install
   ```
2. Copia `.env.example` a `.env` y completa `DATABASE_URL` con tu conexion de PostgreSQL.
3. Corre las migraciones (crea las tablas y carga los ejercicios iniciales):
   ```
   npm run migrate
   ```
4. Inicia el servidor:
   ```
   npm start
   ```
5. Entra a `http://localhost:3000` y registrate para crear tu cuenta.

## Como subirlo a Render (plan free)

1. Subi este proyecto a un repositorio de Git (GitHub, GitLab, etc.).
2. En Render, crea una base de datos PostgreSQL nueva (plan free) y copia su connection string interna.
3. Crea un nuevo Web Service en Render apuntando a tu repositorio:
   - Build Command: `npm install`
   - Start Command: `npm run migrate && npm start`
4. Configura las variables de entorno del Web Service:
   - `DATABASE_URL`: la connection string de tu base de datos de Render
   - `DATABASE_SSL`: `true`
   - `SESSION_SECRET`: cualquier cadena secreta larga
   - `PORT`: `3000` (Render la sobreescribe automaticamente, pero se deja como referencia)
5. Deploy. La primera vez, `npm run migrate` crea las tablas y carga el banco de ejercicios inicial.

Tambien se incluye un archivo `render.yaml` por si preferis usar Render Blueprints para crear el Web Service y la base de datos juntos en un solo paso.

## Estructura del proyecto

```
server/
  data/languages.js     catalogo de lenguajes y su configuracion (colores, indentacion, simbolos)
  data/exercises.js     banco de ejercicios iniciales por lenguaje y dificultad
  routes/                rutas de autenticacion, editor, ejercicios y cuenta
  middleware/auth.js     proteccion de rutas privadas
  utils/                 rachas de actividad y registro de actividad diaria
  migrate.js             crea las tablas y carga los ejercicios
  index.js               arranque del servidor Express
views/                   vistas EJS
public/                  CSS y JS del editor, resaltado de sintaxis, ejercicios, cuenta y graficos
schema.sql               esquema completo de la base de datos
```

Este proyecto esta pensado como base solida para seguir mejorando: podes sumar mas ejercicios, mas lenguajes, o afinar el comportamiento del editor segun lo que necesites.

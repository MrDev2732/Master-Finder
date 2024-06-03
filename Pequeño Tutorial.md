# 📑 Índice

1. [📦 Instalar Poetry](#-instalar-poetry)
2. [📦 Instalar con NPM](#-instalar-con-npm)
3. [🔗 Cómo Conectar al Repositorio](#-cómo-conectar-al-repositorio)
   - [🔑 Iniciar git](#primero,-iniciar-git)
   - [📥 Clonar el repositorio](#luego-desde-el-cmd-pegar-el-siguiente-código)
   - [🌱 Crear una Nueva Rama en Git](#-crear-una-nueva-rama-en-git)
4. [🌟 Cómo Iniciar un Proyecto](#-cómo-iniciar-un-proyecto-)
   - [🏗️ Genera un Monorepo](#-genera-un-monorepo)
   - [👁️ Genera un Nuevo Proyecto (Frontend)](#-genera-un-nuevo-proyecto-frontend)
   - [🚀 Genera un Nuevo Proyecto (Backend)](#-genera-un-nuevo-proyecto-backend)
   - [📚 Genera una Nueva Librería](#-genera-una-nueva-librería-para-utilizar-de-forma-global-entre-los-proyectos)
   - [👓 Genera una nueva vista en un Frontend](#-genera-una-nueva-vista-en-un-frontend)
   - [🛠️ Generar un nuevo servicio](#️generar-un-nuevo-servicio)
   - [🛡️ Generar nuevo guard](#generar-nuevo-guard)
5. [🏃‍♂️ Cómo Correr los Servidores](#-cómo-correr-los-servidores)
   - [🖥️ Backend](#️-backend)
   - [🌍 Frontend](#-frontend)
6. [📦 Cómo Instalar Dependencias](#-cómo-instalar-dependencias)
   - [📜 Usando `poetry`](#-si-vas-a-utilizar-poetry)
   - [📦 Usando `npx`](#-si-vas-a-utilizar-npx)
7. [📝 Notas Adicionales](#-notas-adicionales)

# 📦 Instalar Poetry
Para manejar las dependencias y entornos virtuales de Python de manera eficiente, puedes instalar Poetry utilizando el siguiente comando:
```sh
pip install poetry
```

# 📦 Instalar con NPM
Para instalar las dependencias necesarias para tu proyecto utilizando NPM, puedes ejecutar el siguiente comando en tu terminal:
```sh
npm install
```

# 🔗 Cómo Conectar al Repositorio
### 🔑 Primero, iniciar git
```sh
git init
```
### Luego, desde el CMD, pegar el siguiente código
```sh
git clone https://github.com/MrDev2732/ferremas
```
### 🌱 Crear una Nueva Rama en Git
Para crear una nueva rama y moverte a ella, puedes usar el siguiente comando:
```sh
# Para crear una nueva rama y moverte a ella
git checkout -b nombre-de-la-nueva-rama

# Para eliminar una rama local
git branch -D nombre-de-la-rama-a-eliminar

# Para moverte entre ramas
git checkout nombre-de-la-rama
```

# 🌟 Cómo Iniciar un Proyecto 🌟

## 🏗️ Genera un Monorepo
```sh
npx create-nx-workspace@latest
```

## 👁️ Genera un Nuevo Proyecto (Frontend)
```sh
npx nx g @nx/angular:application "Nombre del frontend"
```

## 🚀 Genera un Nuevo Proyecto (Backend)
```sh
npx nx generate @nxlv/python:poetry-project "Nombre del proyecto | backend" \
--projectType application \
--description='My Project 1' \  # ACA VA UNA BREVE DESCRIPCIÓN DEL PROYECTO
--packageName="src o backend" \
--moduleName="src o backend"
```

## 📚 Genera una Nueva Librería para Utilizar de Forma Global entre los Proyectos
```sh
npx nx generate @nxlv/python:poetry-project "Nombre de la libreria" \
--projectType library \
--description='My Library 1' \  # ACA VA UNA BREVE DESCRIPCIÓN DE LA LIBRERIA
--packageName="src o backend" \
--moduleName="src o backend"
```

## 👓 Genera una nueva vista en un Frontend
```sh
npx nx generate @nrwl/angular:component "nombre de la vista" --project="nombre del frontend" --module=app.module.ts --style=scss --path=apps/frontend-ferremas/src/app/components
```

## 🛠️ Generar un nuevo servicio
```sh
npx nx g service  --project=frontend-ferremas --path=apps/frontend-ferremas/src/services
```

## 🛡️ Generar nuevo guard
```sh
npx nx generate @nrwl/angular:guard guards/auth --project=frontend-ferremas
```

## 🏃‍♂️ Cómo Correr los Servidores

### 🖥️ Backend
1. Usando NX:
    ```sh
    npx nx run backend-ferremas:serve
    ```
2. Usando Uvicorn con Poetry:
    ```sh
    poetry run uvicorn src.main:app --host 0.0.0.0 --port 8000 --log-level info --reload
    # - Tienes que estar dentro de la carpeta
    # - Tienes que haber instalado previamente las dependencias
    #     poetry install
    ```
3. Usando Docker Compose:
    ```sh
    docker-compose up "carpeta" --build
    ```

### 🌍 Frontend
```sh
npx nx serve "frontend"
```

## 📦 Cómo Instalar Dependencias

### 📜 Si vas a utilizar `poetry`
Tienes que ir a la carpeta que quieras actualizar dependencias y ejecutar:
```sh
poetry add "dependencia"
```

### 📦 Si vas a utilizar `npx`
No es necesario estar dentro de la carpeta:
```sh
npx nx run "carpeta":add "dependencia"
```

---

### 📝 Notas Adicionales:

- **Poetry** es una herramienta para manejar dependencias en proyectos de Python. Es muy útil para mantener un entorno limpio y ordenado.
- **NX** es un conjunto de herramientas y extensiones para el monorepo que facilita la gestión de aplicaciones y bibliotecas.
- **Uvicorn** es un servidor ASGI para Python, utilizado comúnmente para correr aplicaciones web rápidas y asincrónicas.

🔧 ¡Asegúrate de tener todas las herramientas necesarias instaladas y configuradas antes de comenzar con tu proyecto!

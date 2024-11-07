# Proyecto de Amigo Invisible

![Amigo Invisible!](https://github.com/user-attachments/assets/c930ede2-5132-42a3-89bd-2c5cee108ec2)

Este proyecto es una aplicación web para organizar juegos de Amigo Invisible. Los usuarios pueden crear un nuevo juego, especificar un presupuesto, agregar participantes y definir excepciones. La aplicación asigna aleatoriamente a cada participante un destinatario y envía correos electrónicos con la información de la asignación.

## Características

- Crear un nuevo juego de Amigo Invisible.
- Especificar un presupuesto para los regalos.
- Agregar participantes con sus nombres y correos electrónicos.
- Definir excepciones para evitar que ciertos participantes se asignen entre sí.
- Enviar correos electrónicos a los participantes con la información de la asignación.

## Tecnologías Utilizadas

- Node.js
- Express
- API Gmail
- Astro
- JavaScript

## Instalación

1. Clona el repositorio:

   git clone https://github.com/tu-usuario/amigo-invisible.git

   cd amigo-invisible

2. Instala las dependencias:

	npm i

3. Configura las credenciales de Google API:

	Crea un proyecto en Google Cloud Console.
	Habilita la API de Gmail.
	Configura la pantalla de consentimiento OAuth.
	Crea credenciales OAuth 2.0 y descarga el archivo credentials.json.
	Guarda el archivo credentials.json en la raíz del proyecto.

4. Ejecuta el servidor:
	node server.js
	npm run dev

## Contribuciones
Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request para discutir cualquier cambio que te gustaría hacer.

## Licencia
Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo LICENSE para obtener más detalles.


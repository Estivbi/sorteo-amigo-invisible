# Cosas que Arreglar

## Problemas Actuales

1. **Cambio de URL al Rellenar el Formulario**
   - **Descripción**: Cuando se rellena el formulario, la URL cambia y agrega los datos del formulario, por ejemplo: `http://localhost:4321/crear?gameName=Navidad&budget=30&participants=caro+carol%40carol.com%2C+carol+carol%40carol.com&exceptions=`.
   - **Solución Propuesta**: Evitar que la URL cambie al enviar el formulario. Asegurarse de que el formulario se envíe mediante JavaScript sin modificar la URL.

2. **Navegación hacia Atrás**
   - **Descripción**: Si se navega hacia atrás después de enviar el formulario, no se vuelve a la página principal directamente. En su lugar, se pasa por todas las veces que se ha rellenado el formulario hasta llegar a la página principal.
   - **Solución Propuesta**: Implementar una redirección a la página principal después de enviar el formulario, de modo que al navegar hacia atrás se vuelva directamente a la página principal.

3. **Lógica de Excepciones**
   - **Descripción**: La lógica de las excepciones no funciona correctamente.
   - **Solución Propuesta**: Revisar y corregir la lógica de las excepciones para asegurarse de que funcione como se espera.

4. **Agregar `console.log` para Depuración**
   - **Descripción**: No hay mensajes de `console.log` para verificar que el código funciona correctamente.
   - **Solución Propuesta**: Agregar mensajes de `console.log` en puntos clave del código para facilitar la depuración.

## Mejoras Necesarias

### 1. Evitar Cambio de URL al Enviar el Formulario
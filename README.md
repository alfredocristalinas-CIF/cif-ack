# CIF_ACK — Repositorio de verificación de integridad documental

Este repositorio implementa una versión estática de **CIF_ACK (Constancia de Integridad de Firma)** para GitHub Pages.

## Estructura

- `index.html`: página pública de presentación.
- `verificar.html`: consulta del registro y verificación local del PDF.
- `css/cif-ack.css`: estilos.
- `js/verificar.js`: carga del registro y cálculo SHA-256 en navegador.
- `registros/41Yogm3MoXvfwQ.json`: registro inicial correspondiente a ACK/01/26.
- `404.html`: respuesta de página no localizada.
- `CNAME.example`: ejemplo para usar dominio propio.

## Registro inicial

- Folio: `ACK/01/26`
- Documento: Formato de Actualización de Datos del Asociado
- Fecha: `2026-09-09`
- SHA-256: `94ea670d8b574304507835e2315f3c55db1fb562cf1666d18ddcb00180fa2a7b`
- Token de consulta: `41Yogm3MoXvfwQ`

Una vez publicado el repositorio, la URL de verificación será:

`https://TU-USUARIO.github.io/cif-ack/verificar.html?t=41Yogm3MoXvfwQ`

Si utiliza dominio propio:

`https://cif.TU-DOMINIO/verificar.html?t=41Yogm3MoXvfwQ`

Esa URL es la que debe codificarse en el QR de la constancia.

## Publicar en GitHub Pages

1. Cree en GitHub un repositorio llamado `cif-ack`.
2. Suba **todo el contenido de esta carpeta** a la rama `main`.
3. Entre a `Settings > Pages`.
4. En `Build and deployment`, seleccione `Deploy from a branch`.
5. Seleccione `main` y `/ (root)`.
6. Guarde los cambios.
7. Espere a que GitHub muestre la URL pública.
8. Pruebe la URL de verificación indicada arriba.

## Dominio propio recomendado

Use un subdominio, por ejemplo:

`cif.electoralexperts.mx`

En el proveedor DNS cree un registro `CNAME` que apunte al host de GitHub Pages de su cuenta. Después, en `Settings > Pages > Custom domain`, introduzca el subdominio y active HTTPS cuando esté disponible.

Copie `CNAME.example` como `CNAME` y sustituya el contenido por su dominio real.

## Crear nuevos registros

1. Genere el SHA-256 del PDF definitivo.
2. No modifique el PDF después de obtener su hash.
3. Cree un token aleatorio no secuencial.
4. Duplique el JSON de ejemplo en `registros/`.
5. Sustituya folio, documento, fecha, hash y estado.
6. Publique los cambios.
7. Construya el QR con la URL:

`https://SU-DOMINIO/verificar.html?t=TOKEN`

## Estados recomendados

- `VIGENTE`
- `REVOCADO`
- `SUSTITUIDO`
- `CANCELADO`

El estado informa sobre el registro. La integridad criptográfica sólo se confirma cuando el PDF presentado produce exactamente la misma huella SHA-256.

## Privacidad

No publique en los JSON datos personales innecesarios. Para el registro basta normalmente con folio, denominación genérica del documento, fecha, algoritmo, hash y estado.

**Advertencia:** en un repositorio público de GitHub el contenido de `registros/` también será público. El token evita enumeración casual desde la URL, pero no constituye un control de acceso. Para confidencialidad real se requiere un backend o repositorio/hosting con controles de acceso.

## Seguridad

- Mantenga GitHub con autenticación multifactor.
- Limite quién puede hacer `push`.
- Use protección de rama si el repositorio admite varios colaboradores.
- No sobrescriba registros históricos; cambie su `estado` o genere uno nuevo.
- Conserve copia externa del PDF maestro y de la constancia CIF_ACK.


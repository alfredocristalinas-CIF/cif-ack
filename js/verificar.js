/*
 * CIF_ACK — Verificador de Integridad
 * verificar.js
 *
 * Funciones:
 * 1. Obtiene el identificador CIF_ACK desde ?t=TOKEN
 * 2. Valida el formato del token.
 * 3. Localiza el registro JSON correspondiente.
 * 4. Muestra los metadatos registrados.
 * 5. Calcula SHA-256 del archivo seleccionado.
 * 6. Compara la huella calculada con la registrada.
 */

"use strict";

let record = null;


/* =========================================================
   UTILIDADES
   ========================================================= */

/**
 * Obtiene un parámetro de la URL.
 */
function qs(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}


/**
 * Actualiza un elemento de estado.
 */
function setStatus(el, text, cls) {
  if (!el) return;

  el.className = "status " + cls;
  el.textContent = text;
}


/**
 * Calcula SHA-256 de un archivo en el navegador.
 */
async function sha256File(file) {
  const buffer = await file.arrayBuffer();

  const digest = await crypto.subtle.digest(
    "SHA-256",
    buffer
  );

  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}


/* =========================================================
   CARGA DEL REGISTRO CIF_ACK
   ========================================================= */

(async function init() {

  const lookup = document.getElementById("lookup");

  /*
   * Recuperar token desde:
   *
   * verificar.html?t=TOKEN
   */
  const rawToken = qs("t");

  /*
   * Normalización básica.
   */
  const token = rawToken
    ? rawToken.trim()
    : "";


  /* ---------------------------------------------------------
     VALIDACIÓN DEL IDENTIFICADOR
     --------------------------------------------------------- */

  /*
   * Se admiten:
   *
   * A-Z
   * a-z
   * 0-9
   * -
   * _
   *
   * Longitud: 6 a 64 caracteres.
   *
   * Esto permite identificadores URL-safe como:
   *
   * ZcjtJx-W2KW6asqm
   */

  if (
    !token ||
    !/^[A-Za-z0-9_-]{6,64}$/.test(token)
  ) {

    console.error(
      "CIF_ACK: identificador inválido:",
      token
    );

    setStatus(
      lookup,
      "No se proporcionó un identificador de consulta válido.",
      "bad"
    );

    return;
  }


  console.log(
    "CIF_ACK — Token recibido:",
    token
  );


  /* ---------------------------------------------------------
     LOCALIZACIÓN DEL REGISTRO
     --------------------------------------------------------- */

  try {

    /*
     * Usamos una URL relativa respecto de verificar.html.
     *
     * Ejemplo:
     *
     * registros/ZcjtJx-W2KW6asqm.json
     */

    const recordURL =
      `./registros/${encodeURIComponent(token)}.json`;

    console.log(
      "CIF_ACK — Buscando registro:",
      recordURL
    );


    /*
     * Evitar que el navegador utilice una copia anterior
     * del registro JSON.
     */

    const res = await fetch(
      recordURL + "?v=" + Date.now(),
      {
        method: "GET",
        cache: "no-store"
      }
    );


    if (!res.ok) {

      throw new Error(
        `Registro no localizado. HTTP ${res.status}`
      );

    }


    record = await res.json();


    /* -------------------------------------------------------
       VALIDACIONES DEL REGISTRO
       ------------------------------------------------------- */

    if (!record) {
      throw new Error(
        "El registro CIF_ACK está vacío."
      );
    }


    if (!record.hash) {
      throw new Error(
        "El registro CIF_ACK no contiene una huella SHA-256."
      );
    }


    if (
      !/^[a-fA-F0-9]{64}$/.test(
        String(record.hash)
      )
    ) {

      throw new Error(
        "La huella SHA-256 registrada no tiene un formato válido."
      );

    }


    /* -------------------------------------------------------
       MOSTRAR METADATOS
       ------------------------------------------------------- */

    const idEl =
      document.getElementById("id");

    const docEl =
      document.getElementById("doc");

    const dateEl =
      document.getElementById("date");

    const stateEl =
      document.getElementById("state");

    const algoEl =
      document.getElementById("algo");

    const expectedEl =
      document.getElementById("expected");

    const metaEl =
      document.getElementById("meta");

    const hashBlockEl =
      document.getElementById("hashBlock");

    const verifyButton =
      document.getElementById("verify");


    if (idEl) {
      idEl.textContent =
        record.id || "";
    }

    if (docEl) {
      docEl.textContent =
        record.documento || "";
    }

    if (dateEl) {
      dateEl.textContent =
        record.fecha_documento || "";
    }

    if (stateEl) {
      stateEl.textContent =
        record.estado || "";
    }

    if (algoEl) {
      algoEl.textContent =
        record.algoritmo || "SHA-256";
    }

    if (expectedEl) {
      expectedEl.textContent =
        record.hash;
    }

    if (metaEl) {
      metaEl.hidden = false;
    }

    if (hashBlockEl) {
      hashBlockEl.hidden = false;
    }

    if (verifyButton) {
      verifyButton.disabled = false;
    }


    /* -------------------------------------------------------
       ESTADO DEL REGISTRO
       ------------------------------------------------------- */

    if (
      String(record.estado)
        .toUpperCase() === "VIGENTE"
    ) {

      setStatus(
        lookup,
        "REGISTRO LOCALIZADO — pendiente de verificación del archivo.",
        "warn"
      );

    } else {

      setStatus(
        lookup,
        `REGISTRO LOCALIZADO — estado: ${record.estado}`,
        "warn"
      );

    }


    console.log(
      "CIF_ACK — Registro cargado:",
      record
    );


  } catch (error) {

    console.error(
      "CIF_ACK — Error al cargar registro:",
      error
    );

    setStatus(
      lookup,
      "No se localizó un registro CIF_ACK asociado a esta URL.",
      "bad"
    );

  }

})();


/* =========================================================
   VERIFICACIÓN CRIPTOGRÁFICA
   ========================================================= */

const verifyButton =
  document.getElementById("verify");


if (verifyButton) {

  verifyButton.addEventListener(
    "click",
    async () => {

      const result =
        document.getElementById("result");

      const fileInput =
        document.getElementById("file");


      /* -----------------------------------------------------
         VALIDAR REGISTRO
         ----------------------------------------------------- */

      if (!record) {

        setStatus(
          result,
          "No hay un registro CIF_ACK cargado.",
          "bad"
        );

        return;
      }


      /* -----------------------------------------------------
         VALIDAR ARCHIVO
         ----------------------------------------------------- */

      if (
        !fileInput ||
        !fileInput.files ||
        !fileInput.files[0]
      ) {

        setStatus(
          result,
          "Seleccione primero el archivo PDF que desea verificar.",
          "warn"
        );

        return;
      }


      const file =
        fileInput.files[0];


      try {

        setStatus(
          result,
          "Calculando huella SHA-256…",
          "neutral"
        );


        /* ---------------------------------------------------
           CALCULAR SHA-256
           --------------------------------------------------- */

        const actual =
          await sha256File(file);


        console.log(
          "CIF_ACK — SHA-256 calculado:",
          actual
        );

        console.log(
          "CIF_ACK — SHA-256 registrado:",
          record.hash
        );


        /* ---------------------------------------------------
           MOSTRAR HUELLA CALCULADA
           --------------------------------------------------- */

        const actualEl =
          document.getElementById("actual");

        const actualWrapEl =
          document.getElementById("actualWrap");


        if (actualEl) {
          actualEl.textContent =
            actual;
        }

        if (actualWrapEl) {
          actualWrapEl.hidden =
            false;
        }


        /* ---------------------------------------------------
           COMPARACIÓN CRIPTOGRÁFICA
           --------------------------------------------------- */

        const expectedHash =
          String(record.hash)
            .trim()
            .toLowerCase();

        const actualHash =
          String(actual)
            .trim()
            .toLowerCase();


        if (
          actualHash === expectedHash
        ) {

          setStatus(
            result,
            "DOCUMENTO ÍNTEGRO — COINCIDE CON EL REGISTRO CIF_ACK.",
            "ok"
          );

        } else {

          setStatus(
            result,
            "ALERTA — LA HUELLA NO COINCIDE CON EL REGISTRO CIF_ACK.",
            "bad"
          );

        }


      } catch (error) {

        console.error(
          "CIF_ACK — Error de verificación:",
          error
        );

        setStatus(
          result,
          "No fue posible calcular la huella del archivo en este navegador.",
          "bad"
        );

      }

    }
  );

}

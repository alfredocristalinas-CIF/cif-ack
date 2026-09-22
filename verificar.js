let record = null;

function qs(name){
  return new URLSearchParams(window.location.search).get(name);
}
function setStatus(el, text, cls){
  el.className = "status " + cls;
  el.textContent = text;
}
async function sha256File(file){
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2,"0")).join("");
}

(async function init(){
  const lookup = document.getElementById("lookup");
  const token = qs("t");
  if(!token || !/^[A-Za-z0-9_-]{6,64}$/.test(token)){
    setStatus(lookup, "No se proporcionó un identificador de consulta válido.", "bad");
    return;
  }
  try{
    const res = await fetch(`registros/${token}.json`, {cache:"no-store"});
    if(!res.ok) throw new Error("Registro no localizado");
    record = await res.json();

    document.getElementById("id").textContent = record.id;
    document.getElementById("doc").textContent = record.documento;
    document.getElementById("date").textContent = record.fecha_documento;
    document.getElementById("state").textContent = record.estado;
    document.getElementById("algo").textContent = record.algoritmo;
    document.getElementById("expected").textContent = record.hash;
    document.getElementById("meta").hidden = false;
    document.getElementById("hashBlock").hidden = false;
    document.getElementById("verify").disabled = false;

    if(record.estado === "VIGENTE"){
      setStatus(lookup, "REGISTRO LOCALIZADO — pendiente de verificación del archivo.", "warn");
    }else{
      setStatus(lookup, `REGISTRO LOCALIZADO — estado: ${record.estado}`, "warn");
    }
  }catch(e){
    setStatus(lookup, "No se localizó un registro CIF_ACK asociado a esta URL.", "bad");
  }
})();

document.getElementById("verify").addEventListener("click", async ()=>{
  const result = document.getElementById("result");
  const file = document.getElementById("file").files[0];
  if(!record){
    setStatus(result, "No hay un registro CIF_ACK cargado.", "bad");
    return;
  }
  if(!file){
    setStatus(result, "Seleccione primero el archivo PDF que desea verificar.", "warn");
    return;
  }
  try{
    setStatus(result, "Calculando huella SHA-256…", "neutral");
    const actual = await sha256File(file);
    document.getElementById("actual").textContent = actual;
    document.getElementById("actualWrap").hidden = false;

    if(actual.toLowerCase() === String(record.hash).toLowerCase()){
      setStatus(result, "DOCUMENTO ÍNTEGRO — COINCIDE CON EL REGISTRO CIF_ACK.", "ok");
    }else{
      setStatus(result, "ALERTA — LA HUELLA NO COINCIDE CON EL REGISTRO CIF_ACK.", "bad");
    }
  }catch(e){
    setStatus(result, "No fue posible calcular la huella del archivo en este navegador.", "bad");
  }
});

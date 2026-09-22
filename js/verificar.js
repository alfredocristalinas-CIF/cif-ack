"use strict";
let record=null;
function setStatus(el,text,cls){if(!el)return;el.className="status "+cls;el.textContent=text;}
function getToken(){const p=new URLSearchParams(window.location.search);const v=p.get("t");return v?v.trim():"";}
async function sha256File(file){const b=await file.arrayBuffer();const d=await crypto.subtle.digest("SHA-256",b);return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,"0")).join("");}
async function loadRecord(){
 const lookup=document.getElementById("lookup"),token=getToken();
 if(!token){setStatus(lookup,"No se proporcionó un identificador de consulta.","bad");return;}
 if(!/^[A-Za-z0-9_-]{6,64}$/.test(token)){setStatus(lookup,"El identificador de consulta tiene un formato inválido.","bad");return;}
 try{
  const u=new URL("registros/"+encodeURIComponent(token)+".json",window.location.href);u.searchParams.set("_",Date.now().toString());
  const res=await fetch(u.toString(),{method:"GET",cache:"no-store"});if(!res.ok)throw new Error("HTTP "+res.status);
  record=await res.json();if(!record.hash||!/^[a-fA-F0-9]{64}$/.test(String(record.hash).trim()))throw new Error("SHA-256 inválido");
  document.getElementById("id").textContent=record.id||"";document.getElementById("doc").textContent=record.documento||"";
  document.getElementById("date").textContent=record.fecha_documento||"";document.getElementById("state").textContent=record.estado||"";
  document.getElementById("algo").textContent=record.algoritmo||"SHA-256";document.getElementById("expected").textContent=record.hash;
  document.getElementById("meta").hidden=false;document.getElementById("hashBlock").hidden=false;document.getElementById("verify").disabled=false;
  setStatus(lookup,String(record.estado).toUpperCase()==="VIGENTE"?"REGISTRO LOCALIZADO — pendiente de verificación del archivo.":"REGISTRO LOCALIZADO — estado: "+(record.estado||"NO INDICADO"),"warn");
 }catch(e){console.error("CIF_ACK:",e);setStatus(lookup,"No se localizó un registro CIF_ACK asociado a esta URL.","bad");}
}
async function verifySelectedFile(){
 const result=document.getElementById("result"),input=document.getElementById("file"),file=input&&input.files?input.files[0]:null;
 if(!record){setStatus(result,"No hay un registro CIF_ACK cargado.","bad");return;}if(!file){setStatus(result,"Seleccione primero el archivo PDF que desea verificar.","warn");return;}
 try{setStatus(result,"Calculando huella SHA-256…","neutral");const actual=await sha256File(file);document.getElementById("actual").textContent=actual;document.getElementById("actualWrap").hidden=false;
 const ok=actual.trim().toLowerCase()===String(record.hash).trim().toLowerCase();setStatus(result,ok?"DOCUMENTO ÍNTEGRO — COINCIDE CON EL REGISTRO CIF_ACK.":"ALERTA — LA HUELLA NO COINCIDE CON EL REGISTRO CIF_ACK.",ok?"ok":"bad");
 }catch(e){console.error("CIF_ACK:",e);setStatus(result,"No fue posible calcular la huella del archivo en este navegador.","bad");}
}
document.addEventListener("DOMContentLoaded",()=>{document.getElementById("verify").addEventListener("click",verifySelectedFile);loadRecord();});
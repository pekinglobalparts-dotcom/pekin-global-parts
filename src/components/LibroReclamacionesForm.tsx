"use client";

import { useState } from "react";

// Servicio gratuito de envío de formularios a correo (sin backend).
// La PRIMERA vez que se envíe, FormSubmit manda un correo de activación a
// esta dirección: hay que abrirlo y confirmar una sola vez. Después, cada
// reclamo llega automáticamente a la bandeja.
const ENDPOINT = "https://formsubmit.co/ajax/alexandramercadovargas@gmail.com";

type Estado = "idle" | "sending" | "ok" | "error";

export function LibroReclamacionesForm() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [codigo, setCodigo] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const now = new Date();
    const cod = `SOV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

    data.append("Código de la hoja", cod);
    data.append("Fecha y hora", now.toLocaleString("es-PE"));
    data.append("_subject", `Libro de Reclamaciones ${cod} — SOV DECO PARTHY`);
    data.append("_captcha", "false");
    data.append("_template", "table");

    setEstado("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (res.ok) {
        setCodigo(cod);
        setEstado("ok");
        form.reset();
      } else {
        setEstado("error");
      }
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <div className="lr-success" role="status">
        <div className="lr-check" aria-hidden="true">✓</div>
        <h3>¡Tu hoja de reclamación fue registrada!</h3>
        <p>
          Tu código de seguimiento es <b>{codigo}</b>. Guárdalo. Nos comunicaremos contigo en un plazo
          máximo de <b>15 días hábiles</b> conforme a ley.
        </p>
        <a className="btn-gold" href="/">Volver al inicio</a>
      </div>
    );
  }

  return (
    <form className="lr-form" onSubmit={onSubmit}>
      {/* Honeypot anti-spam */}
      <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

      <fieldset>
        <legend>1. Tipo de solicitud</legend>
        <div className="lr-radios">
          <label className="lr-radio">
            <input type="radio" name="Tipo" value="Reclamo" required /> <b>Reclamo</b>
            <small>Disconformidad con el producto o servicio.</small>
          </label>
          <label className="lr-radio">
            <input type="radio" name="Tipo" value="Queja" /> <b>Queja</b>
            <small>Malestar respecto a la atención.</small>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>2. Datos del consumidor</legend>
        <div className="lr-grid">
          <label className="lr-field lr-col2">
            <span>Nombres y apellidos *</span>
            <input type="text" name="Nombre completo" required />
          </label>
          <label className="lr-field">
            <span>Tipo de documento *</span>
            <select name="Tipo de documento" required defaultValue="DNI">
              <option value="DNI">DNI</option>
              <option value="Carné de extranjería">Carné de extranjería</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          </label>
          <label className="lr-field">
            <span>N° de documento *</span>
            <input type="text" name="Número de documento" required inputMode="numeric" />
          </label>
          <label className="lr-field lr-col2">
            <span>Domicilio *</span>
            <input type="text" name="Domicilio" required />
          </label>
          <label className="lr-field">
            <span>Teléfono *</span>
            <input type="tel" name="Teléfono" required inputMode="tel" />
          </label>
          <label className="lr-field">
            <span>Correo electrónico *</span>
            <input type="email" name="Correo electrónico" required />
          </label>
          <label className="lr-field lr-col2">
            <span>Nombre del apoderado (solo si el consumidor es menor de edad)</span>
            <input type="text" name="Apoderado (si es menor de edad)" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>3. Identificación del bien contratado</legend>
        <div className="lr-grid">
          <label className="lr-field">
            <span>Tipo *</span>
            <select name="Bien contratado" required defaultValue="Servicio">
              <option value="Servicio">Servicio</option>
              <option value="Producto">Producto</option>
            </select>
          </label>
          <label className="lr-field">
            <span>Monto reclamado (S/)</span>
            <input type="text" name="Monto reclamado (S/)" inputMode="decimal" />
          </label>
          <label className="lr-field lr-col2">
            <span>Descripción del bien o servicio *</span>
            <input type="text" name="Descripción del bien/servicio" required placeholder="Ej. Decoración para cumpleaños del 12/09" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>4. Detalle</legend>
        <label className="lr-field">
          <span>Detalle del reclamo o queja *</span>
          <textarea name="Detalle del reclamo/queja" rows={4} required />
        </label>
        <label className="lr-field">
          <span>Pedido del consumidor *</span>
          <textarea name="Pedido del consumidor" rows={3} required placeholder="¿Qué solución esperas?" />
        </label>
      </fieldset>

      <label className="lr-check-terms">
        <input type="checkbox" required />
        <span>
          Declaro que los datos consignados son verdaderos y autorizo el uso de mi información para dar
          respuesta a esta hoja de reclamación.
        </span>
      </label>

      <p className="lr-legal">
        La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito
        previo para interponer una denuncia ante INDECOPI. El proveedor debe dar respuesta en un plazo máximo
        de <b>15 días hábiles</b> (Código de Protección y Defensa del Consumidor, Ley N° 29571).
      </p>

      {estado === "error" && (
        <p className="lr-error">Ocurrió un problema al enviar. Intenta de nuevo o escríbenos por WhatsApp al 942 392 029.</p>
      )}

      <button type="submit" className="btn-gold lr-submit" disabled={estado === "sending"}>
        {estado === "sending" ? "Enviando…" : "Enviar hoja de reclamación"}
      </button>
    </form>
  );
}

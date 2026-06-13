"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle, Send } from "lucide-react";
import { solicitudSchema, type SolicitudInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const sectorOptions = [
  { value: "ASEGURADORA", label: "Aseguradora" },
  { value: "CONCESIONARIA", label: "Concesionaria" },
  { value: "RENTING", label: "Empresa de Renting" },
  { value: "LEASING", label: "Empresa de Leasing" },
  { value: "FLOTA_CORPORATIVA", label: "Flota Corporativa" },
  { value: "TALLER_AUTORIZADO", label: "Taller Autorizado" },
  { value: "OTRO", label: "Otro" },
];

export function SolicitudForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudInput>({
    resolver: zodResolver(solicitudSchema),
  });

  const onSubmit = async (data: SolicitudInput) => {
    setServerError("");
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Error al enviar la solicitud");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Error de conexión. Por favor intente nuevamente.");
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          ¡Solicitud enviada!
        </h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Hemos recibido su solicitud. Nuestro equipo la revisará en 2 a 5 días
          hábiles y le notificaremos por correo electrónico.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="razonSocial"
          label="Razón social *"
          placeholder="Mi Empresa S.A.C."
          error={errors.razonSocial?.message}
          {...register("razonSocial")}
        />
        <Input
          id="ruc"
          label="RUC *"
          placeholder="20123456789"
          maxLength={11}
          error={errors.ruc?.message}
          {...register("ruc")}
        />
        <Input
          id="emailCorporativo"
          label="Correo corporativo *"
          type="email"
          placeholder="gerencia@empresa.com"
          error={errors.emailCorporativo?.message}
          {...register("emailCorporativo")}
        />
        <Input
          id="telefono"
          label="Teléfono *"
          placeholder="+51 999 999 999"
          error={errors.telefono?.message}
          {...register("telefono")}
        />
        <Select
          id="sector"
          label="Sector *"
          placeholder="Seleccione su sector"
          options={sectorOptions}
          error={errors.sector?.message}
          {...register("sector")}
        />
        <Input
          id="representanteLegal"
          label="Representante legal *"
          placeholder="Juan Pérez García"
          error={errors.representanteLegal?.message}
          {...register("representanteLegal")}
        />
        <Input
          id="cargo"
          label="Cargo *"
          placeholder="Gerente General"
          error={errors.cargo?.message}
          {...register("cargo")}
        />
      </div>

      <Textarea
        id="mensaje"
        label="Mensaje adicional"
        placeholder="Cuéntenos sobre sus necesidades de autopartes, volumen estimado de compra, marcas de vehículos que maneja..."
        rows={4}
        error={errors.mensaje?.message}
        {...register("mensaje")}
      />

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        variant="default"
        loading={isSubmitting}
        className="w-full md:w-auto"
      >
        <Send className="h-4 w-4" />
        Enviar solicitud de afiliación
      </Button>
    </form>
  );
}

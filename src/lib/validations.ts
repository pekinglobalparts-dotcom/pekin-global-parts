import { z } from "zod";

export const solicitudSchema = z.object({
  razonSocial: z.string().min(3, "Mínimo 3 caracteres").max(200),
  ruc: z
    .string()
    .length(11, "El RUC debe tener 11 dígitos")
    .regex(/^\d+$/, "Solo números"),
  emailCorporativo: z.string().email("Email inválido"),
  telefono: z
    .string()
    .min(7, "Teléfono inválido")
    .max(15)
    .regex(/^[\d\s+\-()]+$/, "Formato inválido"),
  sector: z.enum([
    "ASEGURADORA",
    "CONCESIONARIA",
    "RENTING",
    "LEASING",
    "FLOTA_CORPORATIVA",
    "TALLER_AUTORIZADO",
    "OTRO",
  ]),
  representanteLegal: z.string().min(3, "Mínimo 3 caracteres").max(200),
  cargo: z.string().min(2, "Mínimo 2 caracteres").max(100),
  mensaje: z.string().max(1000).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
  role: z.enum(["admin", "socio"]),
});

export const productoSchema = z.object({
  codigo: z.string().min(1).max(50),
  nombre: z.string().min(1).max(200),
  descripcion: z.string().max(2000).optional(),
  imagenUrl: z.string().url().optional().or(z.literal("")),
  categoriaId: z.string().cuid(),
  marcaId: z.string().cuid(),
  modelosCompatibles: z.array(z.string()).default([]),
  precio: z.coerce.number().positive("Precio debe ser positivo"),
  stock: z.coerce.number().int().min(0),
  stockMinimo: z.coerce.number().int().min(0),
  unidad: z.string().default("und"),
  activo: z.boolean().default(true),
  destacado: z.boolean().default(false),
});

export const cotizacionItemSchema = z.object({
  productoId: z.string().cuid(),
  cantidad: z.coerce.number().int().positive(),
  notas: z.string().max(500).optional(),
});

export const cotizacionSchema = z.object({
  notas: z.string().max(1000).optional(),
  items: z.array(cotizacionItemSchema).min(1, "Mínimo 1 producto"),
});

export type SolicitudInput = z.infer<typeof solicitudSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductoInput = z.infer<typeof productoSchema>;
export type CotizacionInput = z.infer<typeof cotizacionSchema>;

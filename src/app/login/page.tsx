"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Building2, ShieldCheck } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get("role") === "admin" ? "admin" : "socio";

  const [role, setRole] = useState<"admin" | "socio">(roleParam);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role },
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      role,
      redirect: false,
    });

    if (res?.error) {
      setError(role === "socio" ? "Credenciales incorrectas. Verifique su RUC y contraseña." : "Credenciales incorrectas. Verifique su email y contraseña.");
      return;
    }

    router.push(role === "admin" ? "/admin" : "/socio");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#e8121a] to-[#a00e12] flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <a href="https://www.pekinglobalparts.com" className="relative flex items-center gap-3">
          <div>
            <span className="text-2xl font-black text-white">PEKIN</span>
            <span className="text-xs font-semibold text-red-200 block tracking-widest">
              GLOBAL PARTS
            </span>
          </div>
        </a>

        <div className="relative">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Tu aliado{" "}
            <span className="text-red-400">en movimiento</span>
          </h2>
          <p className="text-red-100 text-lg">
            Plataforma exclusiva B2B para empresas automotrices.
          </p>
        </div>

        <div className="relative text-slate-500 text-sm">
          © {new Date().getFullYear()} Pekin Global Parts S.A.C.
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <a
            href="https://www.pekinglobalparts.com"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </a>

          {/* Role tabs */}
          <div className="bg-white/5 rounded-xl p-1 flex mb-8">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === "socio"
                  ? "bg-white text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setRole("socio")}
            >
              <Building2 className="h-4 w-4" />
              Portal Socios
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === "admin"
                  ? "bg-white text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setRole("admin")}
            >
              <ShieldCheck className="h-4 w-4" />
              Administración
            </button>
          </div>

          <h1 className="text-2xl font-black text-white mb-2">
            {role === "socio" ? "Bienvenido" : "Panel Administrativo"}
          </h1>
          <p className="text-slate-400 mb-8 text-sm">
            {role === "socio"
              ? "Ingrese con sus credenciales corporativas"
              : "Acceso restringido solo a administradores"}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <input type="hidden" value={role} {...register("role")} />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {role === "socio" ? "RUC" : "Correo electrónico"}
              </label>
              <input
                type="text"
                placeholder={role === "socio" ? "20xxxxxxxxx" : "pekinglobalparts@gmail.com"}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              className="w-full"
            >
              Iniciar sesión
            </Button>
          </form>

          {role === "socio" && (
            <p className="mt-6 text-center text-sm text-slate-500">
              ¿No tiene cuenta?{" "}
              <a href="https://www.pekinglobalparts.com/#afiliacion" className="text-blue-400 hover:text-blue-300">
                Solicite su acceso
              </a>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

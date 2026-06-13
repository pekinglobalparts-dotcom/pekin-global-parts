import { SolicitudForm } from "./SolicitudForm";

export function AfiliacionSection() {
  return (
    <section id="afiliacion" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
            Afiliación
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-3 mb-4">
            Únase a nuestra{" "}
            <span className="text-blue-900">red de socios</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Complete el formulario y en breve nuestro equipo evaluará su solicitud.
            Sin compromisos. Sin costos de afiliación.
          </p>
        </div>

        <div className="bg-slate-50 rounded-3xl p-8 lg:p-12">
          <SolicitudForm />
        </div>
      </div>
    </section>
  );
}

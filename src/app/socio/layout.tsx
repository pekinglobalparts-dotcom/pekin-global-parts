import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SocioSidebar } from "@/components/socio/SocioSidebar";

export const metadata = { title: "Portal Socios | Pekin Global Parts" };

export default async function SocioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    redirect("/login?role=socio");
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <SocioSidebar user={session.user} />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}

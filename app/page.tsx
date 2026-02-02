import { redirect } from "next/navigation";

export default function RootPage() {
  // Langsung arahkan ke route /login saat user mengakses "/"
  redirect("/dashboard_penyewa");
}
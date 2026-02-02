"use client";

import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("https://rentoka.olifemassage.com/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // const res = await fetch("/api/external/login", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email, password }),
    // });

    const data = await res.json();

    if (!data.success) {
      const errorMsg = data.message === "Invalid Credentials" 
        ? "Email atau Password salah!" 
        : data.message;
      throw new Error(errorMsg);
    }

    // Jika sukses, simpan ke localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("id_customer", data.data.id_customer.toString());
    localStorage.setItem("role", data.data.id_provider ? "provider" : "customer");

    router.push("/dashboard_penyewa");
  } catch (err: any) {
    setError(err.message || "Gagal terhubung ke server");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-black">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px]">
        
        {/* LEFT SIDE (Form) */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
          
          <div className="flex items-center gap-3 mb-12">
            <span className="text-5xl font-extrabold tracking-tighter">RK</span>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-[0.25em] uppercase leading-none">RENTOKA</span>
              <div className="bg-black text-white text-[9px] text-center py-0.5 mt-1 tracking-[0.4em] font-bold">
                レントカー
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-black mb-10 tracking-tighter">Sign In</h1>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="p-1.5 border border-gray-300 rounded shadow-sm bg-white">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kaedahara@gmail.com"
                  className="w-full pl-16 pr-4 py-4 bg-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-black outline-none font-medium placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="p-1.5 border border-gray-300 rounded shadow-sm bg-white">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full pl-16 pr-4 py-4 bg-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-black outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer" />
                <span className="text-sm font-bold text-gray-600 group-hover:text-black transition-colors">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-2xl font-black text-xl hover:bg-zinc-800 transition active:scale-[0.98] disabled:opacity-50 mt-4 shadow-lg shadow-black/10"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="space-y-2 pt-4">
              <p className="text-sm font-bold text-gray-400">
                Don't have an account? 
                <Link href="/register" className="ml-1 text-black hover:underline underline-offset-4">Sign Up</Link>
              </p>
              <button type="button" className="text-sm font-bold text-black hover:underline block underline-offset-4">
                Forgot Password
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE (Black Panel) */}
        <div className="hidden md:flex w-1/2 bg-black m-4 rounded-[2.5rem] flex-col justify-center px-16 text-white">
          <span className="text-8xl font-black mb-6 tracking-tighter opacity-90 italic">RK</span>
          <h2 className="text-5xl font-black mb-8 leading-[1.1] tracking-tight">
            Selamat Datang<br />di Rentoka!
          </h2>
          <div className="space-y-5 max-w-sm">
            <p className="text-gray-300 text-lg leading-relaxed font-medium">
              Rentoka membantu anda menemukan mobil yang tersedia untuk disewa dengan mudah dan harga terjangkau.
            </p>
            <p className="text-gray-400 text-sm font-medium border-l-2 border-white/20 pl-4">
              Lebih dari 25rb orang merasa terbantu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
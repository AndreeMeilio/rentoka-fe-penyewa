"use client";

import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://rentoka.olifemassage.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          confirm_password: confirmPassword,
          customer_name: email.split("@")[0],
        }),
      });

      // const res = await fetch("/api/external/register", { 
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     email,
      //     password,
      //     confirm_password: confirmPassword,
      //     customer_name: email.split("@")[0],
      //   }),
      // });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await res.text();
        console.error("Backend Error:", textError);
        throw new Error("Server bermasalah (Response bukan JSON).");
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Register gagal");
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-black">
      {/* Container Utama - Lebar disamakan dengan Login */}
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-16 min-h-[600px] flex flex-col relative">
        
        {/* Logo (Pojok Kiri Atas) */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-5xl font-extrabold tracking-tighter">RK</span>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-[0.25em] uppercase leading-none">RENTOKA</span>
            <div className="bg-black text-white text-[9px] text-center py-0.5 mt-1 tracking-[0.4em] font-bold">
              レントカー
            </div>
          </div>
        </div>

        {/* Form Content (Centered) */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-black mb-10 tracking-tighter">Sign Up</h1>

          {error && (
            <div className="w-full max-w-md bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="w-full max-w-md space-y-5">
            {/* Input Email */}
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

            {/* Input Password */}
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

            {/* Input Konfirmasi Password */}
            <div>
              <label className="block text-sm font-bold mb-2">Konfirmasi Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="p-1.5 border border-gray-300 rounded shadow-sm bg-white">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  className="w-full pl-16 pr-4 py-4 bg-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-black outline-none font-medium"
                />
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-2xl font-black text-xl hover:bg-zinc-800 transition active:scale-[0.98] disabled:opacity-50 mt-4 shadow-lg shadow-black/10"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            {/* Footer Link */}
            <p className="text-sm font-bold text-gray-400 text-left pt-2">
              Have an account?{" "}
              <Link href="/login" className="text-black hover:underline underline-offset-4 ml-1">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
      {/* --- MODAL SUKSES REGISTRASI --- */}
    {showSuccessModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
          
          {/* Icon Checkmark */}
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-6 shadow-xl shadow-black/20">
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl font-black mb-3 tracking-tighter">BERHASIL!</h2>
          
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            Akun Rentoka kamu sudah siap. <br/> Yuk, cari mobil impianmu sekarang.
          </p>

          <button 
            onClick={() => router.push("/login")}
            className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:bg-zinc-800 transition active:scale-[0.98] shadow-lg shadow-black/10"
          >
            Lanjut ke Login
          </button>
        </div>
      </div>
    )}
    </div>
  );
}
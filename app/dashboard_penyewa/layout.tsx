"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, CreditCard, User, LogIn, LogOut, Clock, MapPin } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State baru untuk Waktu dan Lokasi
  const [currentTime, setCurrentTime] = useState("");
  const [location, setLocation] = useState("Mencari lokasi...");

  useEffect(() => {
    const authStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(authStatus);

    // 1. Logika Update Waktu Otomatis
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Mengambil offset GMT (Contoh: GMT+7)
      const offset = -now.getTimezoneOffset() / 60;
      const gmtString = `(GMT ${offset >= 0 ? "+" : ""}${offset})`;
      
      setCurrentTime(`${timeString} ${gmtString}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000); // Update tiap detik

    // 2. Logika Geolocation (Lokasi Device)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Menggunakan Reverse Geocoding gratis (Nominatim OpenStreetMap)
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.municipality || "Lokasi tidak dikenal";
            const country = data.address.country || "Indonesia";
            setLocation(`${city}, ${country}`);
          } catch (error) {
            setLocation("Gagal memuat lokasi");
          }
        },
        () => {
          setLocation("Akses lokasi ditolak");
        }
      );
    } else {
      setLocation("GPS tidak didukung");
    }

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    router.push("/dashboard_penyewa");
  };

  const menuItems = [
    { name: "Home", href: "/dashboard_penyewa", icon: Home, requiresAuth: false },
    { name: "Transaction", href: "/dashboard_penyewa/transactions", icon: CreditCard, requiresAuth: true },
    { name: "Profile", href: "/dashboard_penyewa/profile", icon: User, requiresAuth: true },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F3F4F1]">
      {/* HEADER */}
      <header className="h-28 bg-white border-b border-gray-200 flex items-center justify-between px-10 fixed w-full top-0 z-30 shadow-sm">
        <div className="flex items-center">
          {/* Logo Rentoka */}
          <div className="flex items-center gap-3 w-64"> 
            <span className="text-5xl font-extrabold tracking-tighter text-black leading-none">RK</span>
            <div className="flex flex-col justify-center">
              <span className="text-2xl font-black tracking-[0.05em] uppercase leading-none text-black">RENTOKA</span>
              <div className="bg-black text-white text-[9px] text-center py-1 mt-1 tracking-[0.3em] uppercase font-mono px-2">
                レントカー
              </div>
            </div>
          </div>

          {/* Info Waktu & Lokasi Dinamis */}
          <div className="flex items-center gap-12 ml-12 border-l border-gray-100 pl-12">
            <div className="flex items-center gap-3 text-gray-400">
              <Clock size={24} strokeWidth={1.5} />
              <span className="text-base font-medium italic">
                {currentTime || "Loading..."}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <MapPin size={24} strokeWidth={1.5} />
              <span className="text-base font-medium italic">
                {location}
              </span>
            </div>
          </div>
        </div>

        {/* PROFILE CIRCLE */}
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-blue-500 p-0.5 overflow-hidden cursor-pointer hover:opacity-80 transition">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full bg-gray-100"
              />
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-1 pt-28">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white border-r fixed h-[calc(100vh-7rem)] flex flex-col z-20">
          <nav className="flex-1 flex flex-col pt-6">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const isDisabled = item.requiresAuth && !isLoggedIn;
              const IconComponent = item.icon;

              if (!isDisabled) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 px-8 py-6 text-[17px] transition-all relative ${
                      isActive
                        ? "bg-white text-black font-bold border-l-[6px] border-black"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <IconComponent size={24} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.name}</span>
                  </Link>
                );
              }

              return (
                <div
                  key={item.href}
                  className="flex items-center gap-4 px-8 py-10 text-[17px] text-gray-400 bg-[#D9D9D9] cursor-not-allowed border-b border-gray-300/30"
                >
                  <IconComponent size={24} className="opacity-60" />
                  <span>{item.name}</span>
                </div>
              );
            })}
          </nav>

          <div className="p-6">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg"
              >
                <LogOut size={20} className="rotate-180" />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-3 w-full bg-[#1A69FF] text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg"
              >
                <LogIn size={20} />
                Login
              </Link>
            )}
          </div>
        </aside>

        <main className="flex-1 ml-64 p-12 bg-[#F3F4F1]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
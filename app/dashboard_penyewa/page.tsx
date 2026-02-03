"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MapPin, Loader2 } from "lucide-react";

interface Car {
  id_vehicle: number;
  vehicle_name: string;
  brand: string;
  rental_price: number;
  rate: number;
  rate_count: number;
  image_path: string;
  vehicle_status: string; 
  distance: number | null;
}

export default function DashboardPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = async () => {
    try {
      const token = localStorage.getItem("token");
      const customerId = localStorage.getItem("id_customer");

      const res = await fetch(`https://rentoka.olifemassage.com/api/customer/vehicle?id_customer=${customerId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      const json = await res.json();
      
      if (json.success && json.data) {
        const availableCars = json.data.filter(
          (car: Car) => car.vehicle_status === "AVAILABLE"
        );
        setCars(availableCars);
      }
    } catch (err) {
      console.error("Gagal memuat data mobil:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black w-10 h-10" />
          <p className="font-bold text-sm uppercase tracking-widest text-gray-400">Mencari Mobil Terdekat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        
        {/* Header Statistik */}
        <div className="mb-8 flex items-baseline gap-2">
          <h2 className="text-4xl font-extrabold text-black tracking-tight leading-tight">
            {cars.length}
          </h2>
          <h3 className="text-2xl font-semibold text-black italic tracking-tight">
            Mobil Tersedia
          </h3>
        </div>

        {/* Di dalam return, setelah Header Statistik */}
        {cars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold italic uppercase">Maaf, saat ini tidak ada mobil yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ... mapping cars seperti biasa ... */}
          </div>
        )}

        {/* Grid Car List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <Link 
              key={car.id_vehicle} 
                href={{
                  pathname: `/dashboard_penyewa/${car.id_vehicle}`,
                  query: {
                    name: car.vehicle_name,
                    brand: car.brand,
                    price: car.rental_price,
                    img: car.image_path,
                    rate: car.rate,
                    count: car.rate_count,
                    dist: car.distance
                  }
                }}
                className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group active:scale-[0.98]"
              >
              <div className="flex items-start justify-between mb-5">
                <div className="flex flex-col gap-2">
                  {/* Badge Rating */}
                  <div className="flex items-center gap-1 text-[11px] font-bold text-black bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 w-fit">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>{car.rate || 0}</span>
                    <span className="text-gray-400 font-normal">({car.rate_count || 0})</span>
                  </div>

                  {/* Badge Jarak */}
                  {car.distance !== null && (
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 font-bold ml-1">
                      <MapPin size={12} />
                      <span>
                        {car.distance < 1000 
                          ? `${car.distance} m` 
                          : `${(car.distance / 1000).toFixed(1)} km`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase italic ${
                  car.vehicle_status === 'UNAVAILABLE' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                }`}>
                  {car.vehicle_status === 'UNAVAILABLE' ? 'Habis' : 'Tersedia'}
                </div>
              </div>

              {/* Konten Utama */}
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <h4 className="text-2xl font-black text-black leading-[0.9] uppercase italic break-words max-w-[150px] tracking-tighter">
                    {car.brand} <br/> {car.vehicle_name}
                  </h4>
                </div>
                
                {/* Gambar Mobil (Menggunakan Placeholder Gambar Mobil Realistis) */}
                <div className="relative w-32 h-24">
                  <div className="bg-gray-50 rounded-[1.5rem] w-full h-full flex items-center justify-center group-hover:bg-gray-100 transition-colors overflow-hidden border border-gray-100">
                    {/* Logika: Jika image_path ada gunakan itu, jika tidak ada (atau untuk sementara) gunakan link Unsplash */}
                    <img 
                      src={
                        car.image_path && car.image_path !== "" 
                          ? `https://rentoka.olifemassage.com/${car.image_path}`
                          : `https://p7.hiclipart.com/preview/421/394/316/car-compact-car-3d-computer-graphics-city-car-3d-car.jpg` 
                      }
                      alt="Car Preview"
                      className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback jika link unsplash atau API error
                        e.currentTarget.src = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=300&auto=format&fit=crop";
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Card: Harga */}
              <div className="mt-8 pt-5 border-t border-gray-50">
                <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-[0.15em]">
                  Harga Sewa: 
                  <span className="text-black font-black text-lg ml-2 tracking-tighter italic"> 
                    Rp {Number(car.rental_price).toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] lowercase font-medium"> /hari</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
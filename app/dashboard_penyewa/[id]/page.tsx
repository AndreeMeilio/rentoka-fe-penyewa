"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation"; 
import { X, MapPin, Star, Mail, Lock, ChevronLeft } from "lucide-react";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentError, setPaymentError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinalCheck, setShowFinalCheck] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSuccessSignModal, setShowSuccessSignModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const isAuthValid = () => {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("id_customer");

    if (!token || token === "null" || token === "undefined") return false;
    if (!customerId || customerId === "null") return false;

    return true;
  };

  useEffect(() => {
     console.log("TOKEN:", localStorage.getItem("token"));
     console.log("CUSTOMER:", localStorage.getItem("id_customer"));
     setIsLoggedIn(isAuthValid());
  }, []);



  // Mengambil data dari URL (dikirim dari parent)
  const car = {
    id_vehicle: params.id,
    vehicle_name: searchParams.get("name"),
    brand: searchParams.get("brand"),
    rental_price: Number(searchParams.get("price")),
    image_path: searchParams.get("img") || "",
    rate: searchParams.get("rate"),
    rate_count: searchParams.get("count"),
    distance: searchParams.get("dist") && searchParams.get("dist") !== "null" 
              ? searchParams.get("dist") 
              : null
  };

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone_number: "",
    id_card_number: "",
    email: "",
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    
    if (startDate && endDate && car.rental_price) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end > start) {
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        setDays(diff);
        setTotalPrice(diff * car.rental_price);
      }
    }
  }, [startDate, endDate]);
  

  const handleCreateTransaction = async () => {
  // 1. Validasi sederhana di sisi klien
  if (!startDate || !endDate || !formData.phone_number || !formData.id_card_number) {
    alert("Mohon lengkapi semua data sewa!");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("id_customer"); // Asumsi data user disimpan di sini

    const payload = {
      id_customer: customerId, // Ambil dari profil user
      id_vehicle: car.id_vehicle,
      name: formData.name,
      email: formData.email,
      id_card_number: formData.id_card_number,
      rental_date: startDate,
      return_date: endDate,
      phone_number: formData.phone_number,
      address: formData.address, // Tambahan opsional
    };

    const response = await fetch("https://rentoka.olifemassage.com/api/customer/transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("id_customer");
      router.replace("/login");
      return;
    }

    const result = await response.json();

    console.log(result);
    if (result.success) {
      const newId = result.data.id_transaction;
      console.log(newId);
      //setCurrentTransactionId(result.id_transaction);
      handleProcessPayment(newId);
    } else {
      alert("Gagal membuat transaksi: " + result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan koneksi ke server.");
  }
};

const handleProcessPayment = async (transactionId: any) => {
  try {
    const payload = {
      id_transaction: transactionId,
      payment_method: paymentMethod, // Diambil dari state pilihan user di modal
      payment_total: totalPrice,    // Diambil dari total perhitungan hari * harga
    };

    const response = await fetch("https://rentoka.olifemassage.com/api/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("id_customer");
      router.replace("/login");
      return;
    }

    const result = await response.json();

    if (result.success) {
      // 1. TUTUP semua modal terlebih dahulu agar form tidak terlihat
      setShowFinalCheck(false);
      setShowConfirmModal(false);
      setShowPaymentModal(false);
      
      // 2. Tampilkan modal sukses
      setShowSuccessModal(true);
    } else {
      alert("Gagal memproses pembayaran: " + result.message);
    }
  } catch (error) {
    console.error("Payment Error:", error);
    alert("Terjadi kesalahan sistem saat pembayaran.");
  }
};

const handleSignUp = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();

  setError("");
  setLoading(true);

  if (!email || !password || !confirmPassword) {
    setError("Email dan password wajib diisi");
    setLoading(false);
    return;
  }

  if (password !== confirmPassword) {
    setError("Konfirmasi password tidak cocok!");
    setLoading(false);
    return;
  }

  try {
    const res = await fetch("https://rentoka.olifemassage.com/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        confirm_password: confirmPassword,
        customer_name: email.split("@")[0],
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Register gagal");
    }

    
    //setShowSuccessSignModal(true);
  } catch (err: any) {
    setError(err.message || "Terjadi kesalahan sistem.");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#EFEFEF] w-full max-w-6xl max-h-[95vh] rounded-[2.5rem] shadow-2xl relative overflow-y-auto flex flex-col md:flex-row">
        
        {/* Tombol Close */}
        <button onClick={() => router.back()} className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center z-50 text-black">
          <X size={24} />
        </button>

        
        {/* Sisi Kiri: Form */}
        <div className="flex-[1.2] p-8 space-y-6">
          {/* Logo Section */}
          <div className="flex items-center gap-4 border border-gray-200 w-fit px-6 py-5 rounded-[1.75rem] bg-white shadow-md">
            <span className="text-5xl font-black italic text-black leading-none">RK</span>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-[0.25em] text-black leading-none">RENTOKA</span>
              <span className="bg-black text-[9px] text-white px-2 py-0.5 mt-1 text-center font-mono rounded-md">レントカー</span>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic">
              {car.brand} {car.vehicle_name}
            </h1>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-black">Rp {car.rental_price.toLocaleString("id-ID")}</span>
              <span className="text-gray-400 font-bold text-xl italic">/hari</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
              {car.distance && car.distance !== "null" && car.distance !== "" && (
                <div className="bg-white px-3 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold shadow-sm border border-gray-100 text-black">
                  <MapPin size={12} className="text-gray-500" /> 
                  {/* Jika ingin format meter/km otomatis */}
                  {Number(car.distance) < 1000 
                    ? `${car.distance} m` 
                    : `${(Number(car.distance) / 1000).toFixed(1)} km`}
                </div>
              )}
              <div className="bg-white px-3 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold shadow-sm border border-gray-100 text-black">
                <Star size={12} className="fill-yellow-400 text-yellow-400 border-none" /> {car.rate} <span className="text-gray-400">({car.rate_count})</span>
              </div>
            </div>

          {/* KONDISI TAMPILAN BERDASARKAN STATUS LOGIN */}
          {isLoggedIn ? (
            <div className="bg-white rounded-[2rem] p-4 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-black">Isi Pengajuan Sewa</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">Nama Lengkap</label>
                <input type="text" placeholder="Nama Lengkap" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#EFEFEF] p-3 rounded-xl text-xs font-medium text-gray-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">Email</label>
                <input type="email" placeholder="Email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#EFEFEF] p-3 rounded-xl text-xs font-medium text-gray-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">Nomor KTP</label>
                <input type="text" placeholder="Nomor KTP" 
                value={formData.id_card_number}
                onChange={(e) => setFormData({...formData, id_card_number: e.target.value})}
                className="w-full bg-[#EFEFEF] p-3 rounded-xl text-xs font-medium text-gray-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-800 whitespace-nowrap">Tanggal sewa</label>
                        <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-[#EFEFEF] p-3 rounded-xl text-[10px] font-medium text-gray-400 focus:outline-none text-center"
                        />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-800 whitespace-nowrap">Tanggal kembali</label>
                        <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-[#EFEFEF] p-3 rounded-xl text-[10px] font-medium text-gray-400 focus:outline-none text-center"
                        />
                 </div>
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-xs font-bold text-gray-800">Alamat</label>
                <textarea 
                    placeholder="Alamat" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-[#EFEFEF] p-3 rounded-xl text-[12px] font-medium text-gray-400 focus:outline-none h-20 resize-none leading-relaxed" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">Nomor Telepon</label>
                <input type="text" placeholder="0824-7891-1212" 
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                className="w-full bg-[#EFEFEF] p-3 rounded-xl text-xs font-medium text-gray-500 focus:outline-none" />
              </div>
            </div>
          </div>
          ) : (
            /* --- FORM SIGN UP (BELUM LOGIN) --- */
            <div className="bg-white rounded-[2rem] p-7 shadow-sm space-y-5">
            <h2 className="text-2xl font-bold text-black tracking-tight">Sign Up Terlebih Dahulu</h2>

            <div className="space-y-4">
                {/* EMAIL */}
                <div className="space-y-2">
                <label className="text-base font-bold text-black">
                    Email
                </label>
                <div className="relative">
                    <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black"
                    />
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="unknown@gmail.com"
                    className="w-full bg-[#D9D9D9] pl-12 pr-4 py-3.5 rounded-xl text-sm font-bold text-gray-700 placeholder:text-gray-500 outline-none border-none"
                    />
                </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                <label className="text-base font-bold text-black">
                    Password
                </label>
                <div className="relative">
                    <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black"
                    />
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full bg-[#D9D9D9] pl-12 pr-4 py-3.5 rounded-xl text-sm font-bold text-gray-700 placeholder:text-gray-500 outline-none border-none"
                    />
                </div>
                </div>

                {/* KONFIRMASI PASSWORD */}
                <div className="space-y-2">
                <label className="text-base font-bold text-black">
                    Konfirmasi Password
                </label>
                <div className="relative">
                    <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black"
                    />
                    <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    className="w-full bg-[#D9D9D9] pl-12 pr-4 py-3.5 rounded-xl text-sm font-bold text-gray-700 placeholder:text-gray-500 outline-none border-none"
                    />
                </div>
                </div>
            </div>
          </div>

          )}
        </div>

        {/* RIGHT SIDE: Car Image & Summary */}
        <div className="flex-1 p-10 flex flex-col justify-between items-center ">
          <div className="relative w-full h-64 mt-10">
            <img 
              src={car.image_path} 
              alt="Car Preview"
              className="w-full h-full object-contain drop-shadow-2xl scale-125"
            />
          </div>

          <div className="w-full space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-2xl text-black">Isi Pengajuan Sewa</h3>
              <div className="flex justify-between items-center text-gray-800 font-medium">
                <span>Sewa mobil ({days} hari)</span>
                <span className="font-bold">Rp {totalPrice.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-xl font-bold text-black">Total Pembayaran</p>
                <p className="text-2xl font-black text-black">
                    Rp {totalPrice.toLocaleString()}
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                if (isLoggedIn) {

                  setShowPaymentModal(true); 
                } else {
                   handleSignUp();
                  //router.push("/login");
                }
              }}
              className="w-full bg-black text-white py-5 rounded-2xl font-black text-xl ..."
            >
              {isLoggedIn ? "Continue" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL PEMBAYARAN */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#EFEFEF] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative">
            
            {/* Header Modal */}
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-black"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-black italic uppercase tracking-tight text-black">Choose payment method</h2>
            </div>

            {/* List Metode Pembayaran */}
            <div className="bg-white rounded-[2rem] p-6 space-y-4 shadow-sm">
              {["Credit/Debit cards", "ATM/Bank transfer", "E-wallet"].map((method) => (
                <div 
                  key={method}
                  onClick={() => {
                    setPaymentMethod(method);
                    setPaymentError(false); 
                  }}
                  className={`flex justify-between items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === method ? "border-black bg-gray-50" : "border-gray-100"
                  }`}
                >
                  <span className="font-bold text-gray-800">{method}</span>
                  {paymentMethod === method && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-4 border-r-2 border-b-2 border-white rotate-45 mb-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tombol Submit Final */}
            <button 
              onClick={() => {
                if (!paymentMethod) {
                  setPaymentError(true); 
                } else {
                  setPaymentError(false);
                  setShowPaymentModal(false);
                  setShowConfirmModal(true);
                }
              }}
              className="w-full bg-[#1A1A1A] text-white py-5 rounded-full font-bold text-xl mt-4"
            >
              Continue
            </button>
            {/* Tampilkan pesan hanya jika paymentError bernilai true */}
            {paymentError && (
              <p className="text-red-500 text-[10px] font-bold text-center mt-2 italic">
                *pilih metode pembayaran terlebih dahulu
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI PESANAN */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-[#EFEFEF] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            
            {/* Logo Rentoka di dalam Modal */}
            <div className="flex items-center gap-2 mb-4">
             <span className="text-5xl font-black italic text-black leading-none">RK</span>
              <div className="flex flex-col border-l-2 border-black pl-2">
                <span className="text-xs font-black tracking-widest text-black">RENTOKA</span>
                <span className="text-[7px] bg-black text-white px-1 self-start">レントカー</span>
              </div>
            </div>


            <div className="bg-white rounded-[2rem] p-8 shadow-sm space-y-5">
              <h2 className="text-xl font-bold border-b pb-3 text-black">Konfirmasi pesanan</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Nama mobil:</span>
                  <span className="font-bold text-black">{car.brand} {car.vehicle_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Harga sewa:</span>
                  <span className="font-bold text-black">Rp {car.rental_price.toLocaleString("id-ID")} /hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Lama sewa:</span>
                  <span className="font-bold text-black">{days} hari</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500 font-bold">Metode pembayaran:</span>
                  <span className="font-bold text-black">{paymentMethod}</span>
                </div>
                
                <div className="flex justify-between pt-2">
                  <span className="text-lg font-black uppercase italic text-black">Total:</span>
                  <span className="text-xl font-black text-black">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button 
                  onClick={() => {
                    setShowConfirmModal(false); 
                    setShowFinalCheck(true);
                  }}
                  className="w-full bg-[#1A1A1A] text-white py-4 rounded-full font-bold text-lg hover:bg-black transition-all"
                >
                  Bayar
                </button>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full bg-white text-black py-4 rounded-full font-bold text-lg border-2 border-black hover:bg-gray-50 transition-all"
                >
                  Batalkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP AKHIR (APAKAH ANDA YAKIN?) */}
      {showFinalCheck && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative text-center">
            
            {/* Tombol X Close */}
            <button 
              onClick={() => setShowFinalCheck(false)}
              className="absolute top-4 right-6 text-gray-400 hover:text-black transition-colors"
            >
              <X size={28} />
            </button>

            <div className="flex flex-col items-center space-y-4 pt-4">
              {/* Icon Info */}
              <div className="w-16 h-16 rounded-full border-4 border-black flex items-center justify-center mb-2">
                <span className="text-4xl font-black text-black">i</span>
              </div>

              <h2 className="text-2xl font-extrabold text-black">Apakah anda yakin?</h2>
              
              <p className="text-gray-500 text-sm font-medium px-4 leading-relaxed">
                Kami mohon kepada para penyewa untuk lebih teliti dalam mengisi data pesanan.
              </p>

              <button 
                onClick={() => {
                  handleCreateTransaction();
                }}
                className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold text-base mt-4 hover:bg-black transition-all"
              >
                Ya, bayar & buat pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUKSES PEMBAYARAN */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center transform transition-all animate-in fade-in zoom-in duration-300">
            
            {/* Animasi Checkmark */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-black text-black mb-2 uppercase italic">Success!</h2>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">
              Pembayaran berhasil dikonfirmasi. Pesanan Anda kini sedang kami proses.
            </p>

            <button 
              onClick={() => {
                setShowSuccessModal(false);
                // Gunakan replace agar history form sewa ditimpa oleh halaman transaksi
                router.push("/dashboard_penyewa/transactions");

              }}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform active:scale-95"
            >
              Lihat Pesanan Saya
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUKSES PEMBAYARAN */}
      {showSuccessSignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center transform transition-all animate-in fade-in zoom-in duration-300">
            
            {/* Animasi Checkmark */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-black text-black mb-2 uppercase italic">Success!</h2>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">
              Registrasi berhasil. Silahkan login terlebih dahulu.
            </p>

            <button 
              onClick={() => {
                setShowSuccessSignModal(false);
                // Gunakan replace agar history form sewa ditimpa oleh halaman transaksi
                router.push("/login");
              }}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform active:scale-95"
            >
              Lihat Pesanan Saya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
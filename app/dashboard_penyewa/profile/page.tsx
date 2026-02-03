"use client";

import { useEffect, useState } from "react";
import { PencilLine, MessageSquare, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [userData, setUserData] = useState({
    name: "",
    address: "",
    city: "",
    email: "",
    ktp: "",
    phone: "",
    avatar: "",
    latitude: "",
    longitude: "",
  });

  const getProfile = async () => {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("id_customer");

    if (!token || !customerId) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`https://rentoka.olifemassage.com/api/customer/profile?id_customer=${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error("Gagal load profile");

      setUserData({
        name: json.data.name || "",
        address: json.data.address || "",
        city: json.data.city || "",
        email: json.data.email || "",
        ktp: json.data.id_card_number || "",
        phone: json.data.phone_number || "",
        latitude: json.data.latitude || "",
        longitude: json.data.longitude || "",
        avatar: json.data.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
  setSaving(true);
  try {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("id_customer");

    const payload = {
      name: userData.name,
      address: userData.address,
      city: userData.city,
      email: userData.email,
      id_card_number: userData.ktp, 
      phone_number: userData.phone,
      latitude: userData.latitude, 
      longitude: userData.longitude,
    };

    const res = await fetch(`https://rentoka.olifemassage.com/api/customer/profile?id_customer=${customerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || "Gagal update data");
    }
    
    setEditing(null);
    setModalMessage("Profile berhasil diperbarui!"); 
    setShowErrorModal(true);
  } catch (err: any) {
    setModalMessage(err.message || "Terjadi kesalahan sistem"); 
    setShowErrorModal(true);
  } finally {
    setSaving(false);
  }
};

  useEffect(() => {
    getProfile();
  }, []);

  const renderField = (label: string, key: keyof typeof userData) => (
    <div className="space-y-2">
      <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-3 min-h-[40px]">
        {editing === key ? (
          <div className="flex items-center gap-2 w-full">
            <input
              autoFocus
              value={userData[key]}
              onChange={(e) => setUserData({ ...userData, [key]: e.target.value })}
              className="border-b-2 border-black py-1 text-base w-full outline-none text-black font-bold bg-transparent"
            />
            {saving ? (
              <Loader2 size={16} className="animate-spin text-black" />
            ) : (
              <Check
                size={20}
                className="text-green-600 cursor-pointer hover:scale-110 transition"
                onClick={saveProfile}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <span className="font-bold text-black text-lg tracking-tight">
              {userData[key] || <span className="text-gray-300 italic font-normal text-sm">Belum diisi</span>}
            </span>
            <div 
              onClick={() => setEditing(key)}
              className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition group/icon"
            >
              <PencilLine size={14} className="text-gray-300 group-hover/icon:text-black" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAddressHeader = () => (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-start gap-1 text-left">
        <span className="text-gray-600 text-lg font-medium">Alamat:</span>
        {editing === "address" ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={userData.address}
              onChange={(e) => setUserData({ ...userData, address: e.target.value })}
              className="border-b border-blue-600 py-0 text-gray-500 text-lg outline-none bg-transparent min-w-[200px]"
            />
            {saving ? (
              <Loader2 size={16} className="animate-spin text-blue-600" />
            ) : (
              <Check size={20} className="text-green-600 cursor-pointer" onClick={saveProfile} />
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-lg">
            {userData.address || "Belum diisi"}
          </span>
        )}
      </div>
      {editing !== "address" && (
        <button
          onClick={() => setEditing("address")}
          className="text-blue-700 hover:text-blue-800 font-bold text-lg transition-colors"
        >
          Edit &gt;
        </button>
      )}
    </div>
  );

  if (loading) return <div className="p-10 text-center font-bold text-black">Memuat Profil...</div>;

  return (
    <div className="min-h-screen bg-[#F3F3F3] font-sans pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 gap-6">
          
          {/* KARTU IDENTITAS UTAMA (Header - Alamat Tanpa Pencil) */}
          <div className="bg-white rounded-[2rem] p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center gap-10 border border-gray-100">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-md">
                <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover bg-gray-50" />
              </div>
            </div>

            <div className="flex-1 space-y-1 text-center md:text-left">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Nama Pengguna</p>
              <h2 className="text-4xl font-black text-black uppercase italic tracking-tighter leading-none mb-3">
                {userData.name || "User"}
              </h2>
              {/* Ini bagian yang diubah sesuai gambar (Tanpa Pencil) */}
              {renderAddressHeader()}
            </div>
          </div>

          {/* DETAIL INFORMASI PERSONAL (Tetap Pakai Pencil) */}
          <div className="bg-white rounded-[2rem] p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100">
            <h2 className="text-2xl font-black mb-10 uppercase text-black tracking-tight border-b border-gray-100 pb-5 italic">
              Informasi Personal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
              {renderField("Nama Lengkap", "name")}
              {renderField("Nomor KTP", "ktp")}
              {renderField("No. Handphone", "phone")}
              {renderField("Email Aktif", "email")}
              {renderField("Latitude", "latitude")}
              {renderField("Longitude", "longitude")}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-10 right-10 z-40">
        <button className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:-translate-y-1 transition-all active:scale-95">
          <MessageSquare size={18} />
          Hubungi CS
        </button>
      </div>

      {/* --- CUSTOM MODAL NOTIFICATION (ERROR & SUCCESS) --- */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center transform transition-all animate-in fade-in zoom-in duration-300">
            
            {/* Animasi Icon (Berubah berdasarkan isi pesan) */}
            <div className="flex justify-center mb-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center animate-bounce ${
                modalMessage.toLowerCase().includes("berhasil") ? "bg-green-100" : "bg-red-100"
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                  modalMessage.toLowerCase().includes("berhasil") ? "bg-green-500 shadow-green-200" : "bg-red-500 shadow-red-200"
                }`}>
                  {modalMessage.toLowerCase().includes("berhasil") ? (
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    // Icon Error (!)
                    <span className="text-white text-4xl font-black italic">!</span>
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-black text-black mb-2 uppercase italic">
              {modalMessage.toLowerCase().includes("berhasil") ? "Success!" : "Oops!"}
            </h2>
            
            <p className="text-gray-500 font-medium leading-relaxed mb-8">
              {modalMessage}
            </p>

            <button 
              onClick={() => setShowErrorModal(false)}
              className={`w-full text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform active:scale-95 ${
                modalMessage.toLowerCase().includes("berhasil") ? "bg-black" : "bg-red-600 shadow-lg shadow-red-100"
              }`}
            >
              {modalMessage.toLowerCase().includes("berhasil") ? "Lanjutkan" : "Coba Lagi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
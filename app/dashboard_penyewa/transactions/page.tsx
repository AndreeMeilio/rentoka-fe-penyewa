"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface Transaction {
  id_transaction: number;
  vehicle_name: string;
  transaction_status: string; 
  transaction_date: string;
  total_price: number;
  image_path: string;
  brand: string;
}

interface DetailTransaction {
  customer: {
    name: string;
    id_card: string;
  };
  transaction_date: string;
  vehicle: {
    vehicle_name: string;
  };
}

export default function TransactionPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailData, setDetailData] = useState<DetailTransaction | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "text-green-600";
      case "CANCELLED":
        return "text-red-600";
      case "IN_REVIEW":
        return "text-orange-500";
      default:
        return "text-gray-600";
    }
  };

  const getTransactions = async () => {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("id_customer");

    if (!token || !customerId) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`https://rentoka.olifemassage.com/api/customer/transaction?id_customer=${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("id_customer");
        router.replace("/login");
        return;
      }

      const json = await res.json();
      if (json.success) setTransactions(json.data);
    } catch (err) {
      console.error("Gagal mengambil data transaksi:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionDetail = async (id: number) => {
    setLoadingDetail(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://rentoka.olifemassage.com/api/customer/transaction?id_transaction=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("id_customer");
        router.replace("/login");
        return;
      }
      const json = await res.json();
      if (json.success) {
        setDetailData(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    getTransactions();
  }, []);

  const handleOpenModal = (item: Transaction) => {
    setSelectedTransaction(item);
    fetchTransactionDetail(item.id_transaction);
    setShowCancelModal(true);
  };

  const handleCloseModal = () => {
    setShowCancelModal(false);
    setSelectedTransaction(null);
    setDetailData(null);
    setCancelReason("");
  };

  const submitCancellation = async () => {
  if (!cancelReason.trim()) {
    alert("Mohon isi alasan pembatalan.");
    return;
  }

  const transactionId = selectedTransaction?.id_transaction; 
  if (!transactionId) return;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`https://rentoka.olifemassage.com/api/customer/transaction/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id_transaction: transactionId }),
    });

    if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("id_customer");
        router.replace("/login");
        return;
      }

    const json = await res.json();

    if (res.ok && json.success) {
      setShowCancelModal(false); 
      setShowSuccessModal(true); 
      getTransactions(); 
    } else {
      throw new Error(json.message || "Gagal mengajukan pembatalan.");
    }
  } catch (err: any) {
    console.error("Error cancellation:", err);
    alert(err.message || "Terjadi kesalahan sistem.");
  }
};

  if (loading) return <div className="p-10 text-center font-bold text-black font-sans">Memuat Riwayat...</div>;

  return (
    <div className="min-h-screen bg-[#F3F3F3] font-sans pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-black tracking-tight leading-tight">Riwayat Transaksi</h1>
          <p className="text-gray-500 text-base font-medium">Tinjau seluruh riwayat sewa mobilmu di sini</p>
        </div>

        {/* List Section */}
        <div className="grid grid-cols-1 gap-5">
          {transactions.map((item) => (
            <div 
              key={item.id_transaction} 
              className="bg-white rounded-[2.5rem] p-8 flex flex-wrap md:flex-nowrap items-center justify-between shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-10">
                <div className="w-52 h-32 flex items-center justify-center bg-gray-50 rounded-3xl overflow-hidden">
                  {item.image_path ? (
                    <img src={`http://localhost:8000/${item.image_path}`} alt="Car" className="object-contain w-full h-full p-2" />
                  ) : (
                    <div className="text-gray-300 text-xs italic font-bold uppercase tracking-widest">No Image</div>
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-3xl font-bold text-black tracking-tighter leading-none uppercase italic">
                    {item.brand} {item.vehicle_name}
                  </h2>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-gray-400 text-sm font-semibold">Status:</span>
                    {/* IMPLEMENTASI WARNA STATUS */}
                    <span className={`text-sm font-bold uppercase tracking-tight ${getStatusColor(item.transaction_status)}`}>
                      {item.transaction_status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium pt-4 italic">
                    Menyewa pada: {new Date(item.transaction_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4 min-w-[200px]">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Total Biaya</p>
                  <p className="text-4xl font-black text-black tracking-tighter">
                    Rp {item.total_price.toLocaleString("id-ID")}
                  </p>
                </div>

                {/* LOGIKA KONDISIONAL: Tombol hanya muncul jika status adalah REVIEW */}
                {item.transaction_status.toUpperCase() === "IN_REVIEW" ? (
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="
                          bg-red-600 
                          text-white 
                          px-8 
                          py-2.5 
                          rounded-2xl 
                          text-xs 
                          font-black 
                          uppercase 
                          tracking-wider
                          shadow-md
                          hover:bg-red-700
                          active:scale-95
                          transition-all
                        "                  >
                    Ajukan Pembatalan
                  </button>
                ) : (
                  /* OPSI: Menampilkan badge atau keterangan jika sudah diproses/dibayar agar layout tidak kosong */
                  <div className="px-8 py-2.5 text-[10px] font-bold text-gray-300 uppercase tracking-widest border border-dashed border-gray-100 rounded-2xl">
                    Tidak dapat dibatalkan
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL PEMBATALAN (UKURAN DISESUAIKAN) --- */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-black">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl relative p-8">
            
            {/* Tombol Close sesuai gambar (X di dalam lingkaran) */}
            <button 
              onClick={handleCloseModal} 
              className="absolute top-6 right-6 p-1 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            <h2 className="text-2xl font-bold text-center mb-8">Pembatalan Sewa Mobil</h2>

            {loadingDetail ? (
              <div className="py-10 text-center font-bold text-gray-400">Memuat data...</div>
            ) : (
              <div className="space-y-5">
                {/* Baris Nama & Nomor KTP */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium ml-1">Nama</label>
                    <div className="w-full bg-[#EAEAEA] px-4 py-2.5 rounded-full text-gray-400 text-sm overflow-hidden whitespace-nowrap">
                      {detailData?.customer.name || "-"}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium ml-1">Nomor KTP</label>
                    <div className="w-full bg-[#EAEAEA] px-4 py-2.5 rounded-full text-gray-400 text-sm">
                      {detailData?.customer.id_card || "-"}
                    </div>
                  </div>
                </div>

                {/* Tanggal Sewa */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium ml-1">Tanggal sewa</label>
                  <div className="w-32 bg-[#EAEAEA] px-4 py-2 rounded-full text-gray-400 text-xs text-center">
                    {detailData ? new Date(detailData.transaction_date).toLocaleDateString("id-ID") : "-"}
                  </div>
                </div>

                {/* Alasan Pembatalan */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium ml-1">Alasan pembatalan</label>
                  <textarea 
                    placeholder="Ingin membatalkan pemesanan mobil ini."
                    rows={4}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-[#EAEAEA] p-5 rounded-2xl outline-none text-gray-600 text-sm resize-none placeholder:text-gray-300"
                  />
                </div>

                {/* Tombol Submit Hitam Panjang */}
                <div className="pt-4 flex justify-center">
                  <button 
                    onClick={submitCancellation}
                    className="w-full max-w-md bg-[#1A1A1A] text-white py-3 rounded-full font-bold text-base hover:bg-black transition-all active:scale-[0.98] shadow-lg"
                  >
                    Ajukan Pembatalan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
      )}

      {/* --- MODAL SUKSES (SESUAI GAMBAR) --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-black">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 flex flex-col items-center text-center">
            
            {/* Icon Checkmark Bulat */}
            <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-6">
              <svg 
                className="w-8 h-8 text-black" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-xl font-extrabold mb-3">
              Pengajuan sewa telah dibatalkan
            </h2>

            <p className="text-gray-400 text-sm leading-relaxed mb-8 px-4">
              Pengajuan pembatalanmu telah kami terima, kami akan segera melakukan refund dalam waktu 1x24 jam.
            </p>

            <button 
              onClick={() => {
                setShowSuccessModal(false);
                handleCloseModal(); // Reset state alasan dan transaksi pilihan
              }}
              className="w-full bg-[#1A1A1A] text-white py-3 rounded-2xl font-bold text-sm hover:bg-black transition-all active:scale-[0.98]"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUKSES PEMBATALAN */}
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
              Pengajuan pembatalan berhasil dikirim. Kami akan memproses refund Anda dalam waktu 1x24 jam.
            </p>

            <button 
              onClick={() => {
                setShowSuccessModal(false);
                handleCloseModal(); // Menutup modal pembatalan utama dan reset state
              }}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform active:scale-95"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
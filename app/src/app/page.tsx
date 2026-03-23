import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-6 bg-gray-100 text-gray-800 font-sans">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">
          Moj Budžet
        </h1>
        
        <div className="grid gap-5">
          {/* Dugme za Glavni Plan */}
          <Link 
            href="/plan" 
            className="block p-6 bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-1 text-gray-900">📊 Cashflow Plan</h2>
            <p className="text-sm text-gray-500">Pregled planiranih uplata, isplata i salda po mesecima.</p>
          </Link>

          {/* Dugme za Wolt Dnevnik */}
          <Link 
            href="/wolt" 
            className="block p-6 bg-white rounded-2xl shadow-sm border-l-4 border-teal-500 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-1 text-gray-900">🚲 Wolt Dnevnik</h2>
            <p className="text-sm text-gray-500">Unos dnevnih vožnji, bakšiša, goriva i obračun zarade.</p>
          </Link>
          
          {/* Dugme za Brzi Unos */}
          <Link 
            href="/transakcije" 
            className="block p-6 bg-white rounded-2xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-1 text-gray-900">💳 Nova Transakcija</h2>
            <p className="text-sm text-gray-500">Evidentiraj brzu uplatu ili isplatu (kirija, računi, gorivo).</p>
          </Link>
            {/* Dugme za Praćenje projekcije */}
          <Link href="/projekcija" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-3 hover:bg-gray-50 transition active:scale-95">
          <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
            🔮
        </div>
        <span className="font-bold text-slate-700">Projekcija</span>
        </Link>
        </div>
      </div>
    </main>
  );
}

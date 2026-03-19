import Link from "next/link";
import { planiraniMeseci } from "../data/planData";

export default function PlanPage() {
  return (
    <main className="min-h-screen p-4 bg-gray-50 text-gray-800 font-sans pb-20">
      {/* Zaglavlje ekrana */}
      <div className="flex justify-between items-center mb-6 pt-4 px-2">
        <h1 className="text-2xl font-bold text-slate-800">Cashflow Plan</h1>
        <Link 
          href="/" 
          className="text-sm font-semibold text-blue-600 bg-blue-100 px-4 py-2 rounded-xl shadow-sm active:scale-95 transition"
        >
          ← Nazad
        </Link>
      </div>

      {/* Lista meseci iz tvoje baze */}
      <div className="space-y-6">
        {planiraniMeseci.map((mesec, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
            
            {/* Tamno zaglavlje za svaki mesec */}
            <div className="bg-slate-800 text-white px-5 py-4 flex justify-between items-center">
              <h2 className="text-xl font-black tracking-widest">{mesec.mesec}</h2>
              <div className="text-right">
                <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider mb-1">
                  Planirani ostatak
                </p>
                <p className="text-lg font-bold text-emerald-400">
                  {mesec.planiraniOstatak.toLocaleString("sr-RS")} din
                </p>
              </div>
            </div>

            {/* Lista transakcija u tom mesecu */}
            <div className="divide-y divide-gray-100">
              {mesec.stavke.map((stavka, sIdx) => (
                <div key={sIdx} className="px-5 py-3 flex justify-between items-center hover:bg-blue-50 transition">
                  
                  <div className="flex items-center gap-4">
                    {/* Datum */}
                    <div className="w-12 text-center flex flex-col items-center justify-center bg-gray-100 rounded-lg py-1">
                      <span className="text-xs font-bold text-gray-500 leading-tight">
                        {stavka.datum.replace('.', '.\n')}
                      </span>
                    </div>
                    
                    {/* Opis i Kategorija */}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">{stavka.kategorija}</span>
                      <span className="text-xs text-gray-500 mt-0.5 line-clamp-1">{stavka.opis}</span>
                    </div>
                  </div>

                  {/* Iznos */}
                  <div className={`text-base font-black whitespace-nowrap pl-2 ${
                    stavka.tip === 'uplata' ? 'text-emerald-500' :
                    stavka.tip === 'isplata' ? 'text-rose-500' : 'text-blue-500'
                  }`}>
                    {stavka.tip === 'isplata' ? '-' : stavka.tip === 'uplata' ? '+' : ''}
                    {stavka.iznos.toLocaleString("sr-RS")}
                  </div>
                  
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}
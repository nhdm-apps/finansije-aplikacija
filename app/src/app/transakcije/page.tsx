"use client";

import { useState } from "react";
import Link from "next/link";

export default function UnosTransakcijePage() {
  const [tip, setTip] = useState<"uplata" | "isplata">("isplata");
  const [kategorija, setKategorija] = useState("Gorivo");
  const [iznos, setIznos] = useState("");
  const [litri, setLitri] = useState(""); // Dodato polje za litre
  const [opis, setOpis] = useState("");
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]);

  // Tvoje tačno definisane kategorije iz prvog zahtjeva
  const kategorijeUplata = ["Bakšiš", "Duca uplata", "Wolt", "NBS", "Druge uplate"];
  const kategorijeIsplata = ["Gorivo", "Računi", "Kirija", "Kredit", "Ostale isplate"];

  // Kada korisnik promijeni tip (Uplata/Isplata), resetujemo kategoriju na prvu na listi
  const promeniTip = (noviTip: "uplata" | "isplata") => {
    setTip(noviTip);
    setKategorija(noviTip === "uplata" ? kategorijeUplata[0] : kategorijeIsplata[0]);
  };

  const sacuvajTransakciju = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Sačuvano!\nTip: ${tip}\nKategorija: ${kategorija}\nIznos: ${iznos} RSD\n${kategorija === "Gorivo" && litri ? `Količina: ${litri} L\n` : ''}Opis: ${opis || 'Nema opisa'}`);
    
    // Reset forme
    setIznos("");
    setLitri("");
    setOpis("");
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50 text-gray-800 font-sans pb-20">
      <div className="flex justify-between items-center mb-6 pt-4 px-2">
        <h1 className="text-2xl font-bold text-slate-800">Transakcija</h1>
        <Link href="/" className="text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-xl">
          ← Nazad
        </Link>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        
        {/* Odabir tipa transakcije (Dugmad umjesto padajućeg menija za brži unos) */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button 
            type="button"
            onClick={() => promeniTip("uplata")}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${tip === "uplata" ? "bg-emerald-500 text-white shadow" : "text-gray-500"}`}
          >
            Uplata (+)
          </button>
          <button 
            type="button"
            onClick={() => promeniTip("isplata")}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${tip === "isplata" ? "bg-rose-500 text-white shadow" : "text-gray-500"}`}
          >
            Isplata (-)
          </button>
        </div>

        <form onSubmit={sacuvajTransakciju} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Datum</label>
            <input type="date" required value={datum} onChange={(e) => setDatum(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Kategorija</label>
            <select 
              value={kategorija} 
              onChange={(e) => setKategorija(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none appearance-none"
            >
              {(tip === "uplata" ? kategorijeUplata : kategorijeIsplata).map(kat => (
                <option key={kat} value={kat}>{kat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={kategorija !== "Gorivo" ? "col-span-2" : ""}>
              <label className="block text-xs font-bold text-gray-500 mb-1">Iznos (RSD)</label>
              <input type="number" required placeholder="0" value={iznos} onChange={(e) => setIznos(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none font-bold" />
            </div>
            
            {/* OVO SE POJAVLJUJE SAMO AKO JE IZABRANO GORIVO */}
            {kategorija === "Gorivo" && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Litraža (L)</label>
                <input type="number" step="0.01" required placeholder="npr. 15.5" value={litri} onChange={(e) => setLitri(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Napomena / Detalji (opciono)</label>
            <input type="text" placeholder="npr. Registracija, majstor..." value={opis} onChange={(e) => setOpis(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          <button type="submit" 
            className={`w-full text-white font-bold text-sm py-4 rounded-xl shadow-md transition mt-6 ${tip === "uplata" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"}`}>
            Evidentiraj {tip}
          </button>
        </form>
      </div>
    </main>
  );
}
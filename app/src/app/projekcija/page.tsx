"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function ProjekcijaPage() {
  const [trenutniSaldo, setTrenutniSaldo] = useState(0);
  const [planirane, setPlanirane] = useState<any[]>([]);
  const [ucitava, setUcitava] = useState(true);

  // Forma za unos plana
  const [datum, setDatum] = useState("");
  const [tip, setTip] = useState("isplata");
  const [kategorija, setKategorija] = useState("");
  const [opis, setOpis] = useState("");
  const [iznos, setIznos] = useState("");

  useEffect(() => {
    fetchPodatke();
  }, []);

  const fetchPodatke = async () => {
    // 1. Računamo STVARNI trenutni saldo (iz transakcija i Wolta)
    const { data: transData } = await supabase.from("transakcije").select("*");
    const { data: woltData } = await supabase.from("wolt_dnevnik").select("*");
    
    let stvarniPrihodi = 0;
    let stvarniRashodi = 0;

    if (transData) {
      stvarniPrihodi += transData.filter(t => t.tip === "uplata").reduce((sum, t) => sum + t.iznos, 0);
      stvarniRashodi += transData.filter(t => t.tip === "isplata").reduce((sum, t) => sum + t.iznos, 0);
    }
    if (woltData) {
      stvarniPrihodi += woltData.reduce((sum, w) => sum + w.zarada + w.baksis, 0);
    }
    const saldo = stvarniPrihodi - stvarniRashodi;
    setTrenutniSaldo(saldo);

    // 2. Povlačimo PLANIRANE transakcije, sortirane hronološki
    const { data: planData } = await supabase
      .from("plan_transakcija")
      .select("*")
      .order("datum", { ascending: true });
    
    setPlanirane(planData || []);
    setUcitava(false);
  };

  const dodajPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setUcitava(true);

    const { error } = await supabase.from("plan_transakcija").insert([{
      datum,
      tip,
      kategorija,
      opis,
      iznos: Number(iznos)
    }]);

    if (!error) {
      setDatum(""); setKategorija(""); setOpis(""); setIznos("");
      fetchPodatke(); // Osvežavamo listu
    } else {
      alert("Greška: " + error.message);
      setUcitava(false);
    }
  };

  const obrisiPlan = async (id: number) => {
    if (confirm("Da li si siguran da želiš da obrišeš ovu stavku iz plana? (Uradi ovo kada se transakcija stvarno desi i uneseš je u glavni dnevnik)")) {
      setUcitava(true);
      await supabase.from("plan_transakcija").delete().eq("id", id);
      fetchPodatke();
    }
  };

  // --- MATEMATIKA ZA RUNNING BALANCE (OSTATAK) ---
  let tekuciOstatak = trenutniSaldo;
  const planSaOstatkom = planirane.map(stavka => {
    if (stavka.tip === "uplata") {
      tekuciOstatak += stavka.iznos;
    } else {
      tekuciOstatak -= stavka.iznos;
    }
    return { ...stavka, ostatak: tekuciOstatak };
  });

  return (
    <main className="min-h-screen p-4 bg-gray-50 text-gray-800 font-sans pb-20">
      <div className="flex justify-between items-center mb-6 pt-4 px-2">
        <h1 className="text-2xl font-bold text-slate-800">Projekcija (Excel)</h1>
        <Link href="/" className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">← Nazad</Link>
      </div>

      {ucitava ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Računanje projekcije...</div>
      ) : (
        <>
          {/* TRENUTNO (POČETNO) STANJE */}
          <div className="bg-slate-800 text-white p-5 rounded-3xl shadow-lg mb-6 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 font-bold mb-1">STVARNI SALDO (Danas)</p>
              <h2 className="text-3xl font-black">{trenutniSaldo.toLocaleString("sr-RS")} RSD</h2>
            </div>
            <div className="text-4xl opacity-20">⚖️</div>
          </div>

          {/* FORMA ZA UNOS PLANA */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-sm font-bold text-slate-800 mb-3 border-b pb-2">Dodaj u plan</h2>
            <form onSubmit={dodajPlan} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="date" required value={datum} onChange={(e) => setDatum(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={tip} onChange={(e) => setTip(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="isplata">Isplata (Minus)</option>
                  <option value="uplata">Uplata (Plus)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" required placeholder="Kategorija (npr. NBS)" value={kategorija} onChange={(e) => setKategorija(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" required placeholder="Iznos" value={iznos} onChange={(e) => setIznos(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <input type="text" placeholder="Opis (npr. Rate za školu) - opciono" value={opis} onChange={(e) => setOpis(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-sm py-3 rounded-xl shadow-md hover:bg-indigo-700">
                + Ubaci u projekciju
              </button>
            </form>
          </div>

          {/* VREMENSKA LINIJA (EXCEL PRIKAZ) */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-800 ml-2">Budući tokovi i Ostatak</h2>
            
            {planSaOstatkom.length === 0 ? (
              <p className="text-sm text-gray-400 ml-2">Plan je trenutno prazan.</p>
            ) : (
              planSaOstatkom.map((stavka) => (
                <div key={stavka.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md mr-2">
                        {new Date(stavka.datum).toLocaleDateString("sr-RS", { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="font-bold text-sm text-slate-800">{stavka.kategorija}</span>
                      {stavka.opis && <p className="text-[10px] text-gray-500 mt-1">{stavka.opis}</p>}
                    </div>
                    <button onClick={() => obrisiPlan(stavka.id)} className="text-gray-300 hover:text-red-500">✖</button>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                    <div className={`text-sm font-bold ${stavka.tip === 'uplata' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {stavka.tip === 'uplata' ? '+' : '-'}{stavka.iznos.toLocaleString("sr-RS")}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Ostatak</p>
                      <p className={`text-lg font-black ${stavka.ostatak < 0 ? 'text-red-600 bg-red-50 px-2 rounded-lg' : 'text-slate-700'}`}>
                        {stavka.ostatak.toLocaleString("sr-RS")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function PlanPage() {
  const [sveTransakcije, setSveTransakcije] = useState<any[]>([]);
  const [sviWoltUnosi, setSviWoltUnosi] = useState<any[]>([]);
  const [ucitava, setUcitava] = useState(true);
  
  // Postavljamo default period na 1-15 ili 16-kraj zavisno od današnjeg datuma
  const [period, setPeriod] = useState(() => {
    return new Date().getDate() <= 15 ? "1-15" : "16-kraj";
  });
  const [prikaziDetalje, setPrikaziDetalje] = useState(false);

  useEffect(() => {
    fetchSvePodatke();
  }, []);

  const fetchSvePodatke = async () => {
    const { data: transData } = await supabase.from("transakcije").select("*");
    const { data: woltData } = await supabase.from("wolt_dnevnik").select("*");
    
    setSveTransakcije(transData || []);
    setSviWoltUnosi(woltData || []);
    setUcitava(false);
  };

  // --- LOGIKA ZA PERIOD ---
  const getGranicePerioda = (p: string) => {
    const danas = new Date();
    const g = danas.getFullYear();
    const m = danas.getMonth();
    
    switch (p) {
      case "1-15": return { pocetak: new Date(g, m, 1), kraj: new Date(g, m, 15, 23, 59, 59) };
      case "16-kraj": return { pocetak: new Date(g, m, 16), kraj: new Date(g, m + 1, 0, 23, 59, 59) };
      case "ovaj_mesec": return { pocetak: new Date(g, m, 1), kraj: new Date(g, m + 1, 0, 23, 59, 59) };
      case "3_meseca": return { pocetak: new Date(g, m - 2, 1), kraj: new Date(g, m + 1, 0, 23, 59, 59) };
      case "6_meseci": return { pocetak: new Date(g, m - 5, 1), kraj: new Date(g, m + 1, 0, 23, 59, 59) };
      default: return { pocetak: new Date(2000, 0, 1), kraj: new Date(2100, 0, 1) };
    }
  };

  const { pocetak, kraj } = getGranicePerioda(period);

  // --- GLAVNI SALDO (UKUPNO VREME) ---
  const ukPrihodiSve = sveTransakcije.filter(t => t.tip === "uplata").reduce((sum, t) => sum + t.iznos, 0) + 
                       sviWoltUnosi.reduce((sum, w) => sum + w.zarada + w.baksis, 0);
  const ukRashodiSve = sveTransakcije.filter(t => t.tip === "isplata").reduce((sum, t) => sum + t.iznos, 0);
  const trenutniSaldoSve = ukPrihodiSve - ukRashodiSve;

  // --- FILTRIRANJE ZA IZABRANI PERIOD ---
  const transUPeriodu = sveTransakcije.filter(t => {
    const d = new Date(t.datum);
    return d >= pocetak && d <= kraj;
  });
  
  const woltUPeriodu = sviWoltUnosi.filter(w => {
    const d = new Date(w.datum);
    return d >= pocetak && d <= kraj;
  });

  // --- MATEMATIKA PERIODA ---
  const p_woltZarada = woltUPeriodu.reduce((sum, w) => sum + w.zarada, 0);
  const p_woltBaksis = woltUPeriodu.reduce((sum, w) => sum + w.baksis, 0);
  const p_ostaliPrihodi = transUPeriodu.filter(t => t.tip === "uplata").reduce((sum, t) => sum + t.iznos, 0);
  const p_ukupnoPrihodi = p_woltZarada + p_woltBaksis + p_ostaliPrihodi;
  
  const p_ukupnoRashodi = transUPeriodu.filter(t => t.tip === "isplata").reduce((sum, t) => sum + t.iznos, 0);

  const p_kmWolt = woltUPeriodu.reduce((sum, w) => sum + w.km_wolt, 0);
  const p_kmPrivatno = woltUPeriodu.reduce((sum, w) => sum + w.km_privatno, 0);
  const p_ukupnoKm = p_kmWolt + p_kmPrivatno;

  const p_trosakGoriva = transUPeriodu.filter(t => t.kategorija === "Gorivo").reduce((sum, t) => sum + t.iznos, 0);
  const cenaPoKm = p_ukupnoKm > 0 ? (p_trosakGoriva / p_ukupnoKm).toFixed(2) : "0.00";

  const p_kategorije = transUPeriodu.filter(t => t.tip === "isplata").reduce((acc, t) => {
    acc[t.kategorija] = (acc[t.kategorija] || 0) + t.iznos;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="min-h-screen p-4 bg-gray-50 text-gray-800 font-sans pb-20">
      <div className="flex justify-between items-center mb-6 pt-4 px-2">
        <h1 className="text-2xl font-bold text-slate-800">Analitika</h1>
        <Link href="/" className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">← Nazad</Link>
      </div>

      {ucitava ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Računanje bilansa...</div>
      ) : (
        <>
          {/* 1. TRENUTNI SALDO (UKUPNO STANJE U KASI) */}
          <div className={`p-6 rounded-3xl shadow-lg mb-6 relative overflow-hidden ${trenutniSaldoSve < 0 ? 'bg-rose-600' : 'bg-slate-800'}`}>
            <p className="text-sm font-semibold text-white/80 mb-1">Trenutni Saldo (Ukupno)</p>
            <h2 className="text-4xl font-black text-white">
              {trenutniSaldoSve.toLocaleString("sr-RS")} <span className="text-xl opacity-70">RSD</span>
            </h2>
          </div>

          {/* 2. IZBOR PERIODA */}
          <div className="mb-6">
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 shadow-sm outline-none"
            >
              <option value="1-15">Obračun: 1. do 15. u mesecu</option>
              <option value="16-kraj">Obračun: 16. do kraja meseca</option>
              <option value="ovaj_mesec">Mesečni nivo</option>
              <option value="3_meseca">Tromesečno (Kvartal)</option>
              <option value="6_meseci">Polugodišnje</option>
            </select>
          </div>

          {/* 3. PRESEK PERIODA */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm">
              <p className="text-xs font-bold text-emerald-500 mb-1">Prihodi (Period)</p>
              <p className="text-lg font-black text-slate-800">+{p_ukupnoPrihodi.toLocaleString()} RSD</p>
              <div className="text-[10px] text-gray-500 mt-2 font-medium">
                Wolt: {p_woltZarada} <br/> Bakšiš: {p_woltBaksis} <br/> Ostalo: {p_ostaliPrihodi}
              </div>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-sm">
              <p className="text-xs font-bold text-rose-500 mb-1">Rashodi (Period)</p>
              <p className="text-lg font-black text-slate-800">-{p_ukupnoRashodi.toLocaleString()} RSD</p>
              <div className="mt-2 space-y-1">
                {Object.entries(p_kategorije).map(([kat, iznos]) => (
                  <div key={kat} className="text-[10px] flex justify-between text-gray-500 font-medium">
                    <span>{kat}</span> <span>{iznos.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. ANALITIKA KILOMETRAŽE */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-sm font-bold text-slate-800 mb-3">Analitika vožnje (Period)</h2>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-gray-500">Ukupno pređeno:</span>
              <span className="font-bold">{p_ukupnoKm} km</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-xs text-gray-400">
              <span>Wolt: {p_kmWolt}km</span>
              <span>Privatno: {p_kmPrivatno}km</span>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-3 flex justify-between items-center border border-orange-100">
              <span className="text-xs font-bold text-orange-800">Gorivo vs Kilometri</span>
              <span className="font-black text-orange-600">{cenaPoKm} RSD / km</span>
            </div>
          </div>

          {/* 5. DETALJNIJE (LISTA UNOSA) */}
          <button 
            onClick={() => setPrikaziDetalje(!prikaziDetalje)}
            className="w-full bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm mb-4"
          >
            {prikaziDetalje ? "Sakrij detalje perioda ↑" : "Prikaži detaljno po danima ↓"}
          </button>

          {prikaziDetalje && (
            <div className="space-y-3">
              {[...transUPeriodu, ...woltUPeriodu]
                .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
                .map((stavka, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-bold text-slate-700">{stavka.datum}</div>
                      <div className="text-xs text-gray-500">
                        {stavka.kategorija || `Wolt Dnevnik (Zarada: ${stavka.zarada})`}
                      </div>
                    </div>
                    <div className={`font-bold ${stavka.tip === 'isplata' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {stavka.tip === 'isplata' ? '-' : '+'}{stavka.iznos || (stavka.zarada + stavka.baksis)}
                    </div>
                  </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
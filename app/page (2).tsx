"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

// Definišemo kako izgleda transakcija koju dobijamo iz baze
interface Transakcija {
  id: number;
  datum: string;
  tip: string;
  kategorija: string;
  iznos: number;
}

export default function PlanPage() {
  const [transakcije, setTransakcije] = useState<Transakcija[]>([]);
  const [ucitava, setUcitava] = useState(true);

  // Čim se stranica otvori, pokrećemo povlačenje podataka iz baze
  useEffect(() => {
    fetchTransakcije();
  }, []);

  const fetchTransakcije = async () => {
    const { data, error } = await supabase
      .from("transakcije")
      .select("*")
      .order("datum", { ascending: false }); // Sortiramo od najnovijih

    if (error) {
      alert("Greška pri učitavanju plana: " + error.message);
    } else {
      setTransakcije(data || []);
    }
    setUcitava(false);
  };

  // --- MATEMATIKA ---
  
  // 1. Ukupni prihodi i rashodi
  const ukupnoPrihodi = transakcije
    .filter((t) => t.tip === "uplata")
    .reduce((sum, t) => sum + t.iznos, 0);

  const ukupnoRashodi = transakcije
    .filter((t) => t.tip === "isplata")
    .reduce((sum, t) => sum + t.iznos, 0);

  // 2. Trenutno stanje u kasi (Saldo)
  const trenutniSaldo = ukupnoPrihodi - ukupnoRashodi;

  // 3. Grupisanje troškova (koliko je otišlo na gorivo, koliko na račune...)
  const potrosnjaPoKategorijama = transakcije
    .filter((t) => t.tip === "isplata")
    .reduce((acc, t) => {
      acc[t.kategorija] = (acc[t.kategorija] || 0) + t.iznos;
      return acc;
    }, {} as Record<string, number>);

  return (
    <main className="min-h-screen p-4 bg-gray-50 text-gray-800 font-sans pb-20">
      <div className="flex justify-between items-center mb-6 pt-4 px-2">
        <h1 className="text-2xl font-bold text-slate-800">Cashflow Plan</h1>
        <Link href="/" className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
          ← Nazad
        </Link>
      </div>

      {ucitava ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse">
          Učitavanje podataka iz baze...
        </div>
      ) : (
        <>
          {/* GLAVNI SALDO (TRENUTNO STANJE) */}
          <div className="bg-slate-800 text-white p-6 rounded-3xl shadow-lg mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💸</div>
            <p className="text-sm font-semibold text-slate-300 mb-1">Trenutni Saldo</p>
            <h2 className={`text-4xl font-black ${trenutniSaldo < 0 ? "text-rose-400" : "text-white"}`}>
              {trenutniSaldo.toLocaleString("sr-RS")} <span className="text-xl text-slate-400">RSD</span>
            </h2>
          </div>

          {/* PRIHODI I RASHODI KARTICE */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100">
              <p className="text-xs font-bold text-emerald-500 mb-1">Ukupni Prihodi ⬇</p>
              <p className="text-xl font-bold text-slate-800">{ukupnoPrihodi.toLocaleString("sr-RS")}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-rose-100">
              <p className="text-xs font-bold text-rose-500 mb-1">Ukupni Rashodi ⬆</p>
              <p className="text-xl font-bold text-slate-800">{ukupnoRashodi.toLocaleString("sr-RS")}</p>
            </div>
          </div>

          {/* PRESEK TROŠKOVA (GDE JE OTIŠAO NOVAC) */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Gde je otišao novac?</h2>
            
            {Object.keys(potrosnjaPoKategorijama).length === 0 ? (
              <p className="text-sm text-gray-400">Još uvek nemaš unetih troškova.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(potrosnjaPoKategorijama)
                  .sort(([, a], [, b]) => b - a) // Sortiramo da najveći trošak bude prvi
                  .map(([kategorija, iznos]) => {
                    const procenat = Math.round((iznos / ukupnoRashodi) * 100);
                    return (
                      <div key={kategorija}>
                        <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                          <span>{kategorija}</span>
                          <span>{iznos.toLocaleString("sr-RS")} RSD</span>
                        </div>
                        {/* Progress Bar za vizuelni prikaz */}
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div 
                            className="bg-rose-500 h-2.5 rounded-full" 
                            style={{ width: `${procenat}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
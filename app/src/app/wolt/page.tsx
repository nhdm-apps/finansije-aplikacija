"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

interface Unos {
  id: number;
  vreme: string;
  datum: string;
  zarada: number;
  baksis: number;
  kmWolt: number;
  kmPrivatno: number;
  odometar: number;
}

export default function WoltPage() {
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]);
  const [zarada, setZarada] = useState("");
  const [baksis, setBaksis] = useState("");
  const [odometar, setOdometar] = useState("");
  const [kmPrivatno, setKmPrivatno] = useState("");
  
  const [ucitava, setUcitava] = useState(false);
  const [dnevniUnosi, setDnevniUnosi] = useState<Unos[]>([]);
  const [prosloStanjeSata, setProsloStanjeSata] = useState(0);

  // Povlačimo zadnje stanje sata iz baze kada se otvori ekran
  useEffect(() => {
    const fetchZadnjiOdometar = async () => {
      const { data } = await supabase
        .from('wolt_dnevnik')
        .select('odometar')
        .order('datum', { ascending: false })
        .order('id', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0 && data[0].odometar) {
        setProsloStanjeSata(data[0].odometar);
        setOdometar(data[0].odometar.toString());
      }
    };
    fetchZadnjiOdometar();
  }, []);

  // Automatska računica za Wolt kilometre
  const unesenoStanje = Number(odometar) || prosloStanjeSata;
  const unesenoPrivatno = Number(kmPrivatno) || 0;
  const razlikaSata = Math.max(0, unesenoStanje - prosloStanjeSata);
  const racunatiKmwolt = Math.max(0, razlikaSata - unesenoPrivatno);

  const sacuvajUnos = async (e: React.FormEvent) => {
    e.preventDefault();
    setUcitava(true);

    const { data, error } = await supabase
      .from('wolt_dnevnik')
      .insert([{
          datum: datum,
          zarada: Number(zarada) || 0,
          baksis: Number(baksis) || 0,
          km_wolt: racunatiKmwolt,
          km_privatno: unesenoPrivatno,
          odometar: unesenoStanje
      }])
      .select();

    setUcitava(false);

    if (error) {
      alert("Greška pri upisu: " + error.message);
      return;
    }

    if (data && data.length > 0) {
      const upisano = data[0];
      setDnevniUnosi([{
        id: upisano.id,
        vreme: new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }),
        datum: upisano.datum,
        zarada: upisano.zarada,
        baksis: upisano.baksis,
        kmWolt: upisano.km_wolt,
        kmPrivatno: upisano.km_privatno,
        odometar: upisano.odometar
      }, ...dnevniUnosi]);
      
      setProsloStanjeSata(unesenoStanje); // Ažuriramo memoriju na novo stanje
    }

    setZarada("");
    setBaksis("");
    setKmPrivatno("");
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50 text-gray-800 font-sans pb-20">
      <div className="flex justify-between items-center mb-6 pt-4 px-2">
        <h1 className="text-2xl font-bold text-slate-800">Wolt Dnevnik</h1>
        <Link href="/" className="text-sm font-semibold text-teal-600 bg-teal-50 px-4 py-2 rounded-xl">← Nazad</Link>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <form onSubmit={sacuvajUnos} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Datum</label>
            <input type="date" required value={datum} onChange={(e) => setDatum(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Bruto zarada</label>
              <input type="number" placeholder="npr. 1500" value={zarada} onChange={(e) => setZarada(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Bakšiš</label>
              <input type="number" placeholder="npr. 200" value={baksis} onChange={(e) => setBaksis(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trenutno stanje sata (Prošlo: {prosloStanjeSata} km)
              </label>
              <input type="number" required placeholder="Unesi novo stanje" value={odometar} onChange={(e) => setOdometar(e.target.value)}
                className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-lg font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Od toga Privatno (km)</label>
                <input type="number" placeholder="npr. 10" value={kmPrivatno} onChange={(e) => setKmPrivatno(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div className="bg-slate-100 px-4 py-3 rounded-xl border border-slate-200 text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Wolt pređeno</span>
                <span className="text-lg font-black text-slate-700">{racunatiKmwolt} km</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={ucitava}
            className={`w-full text-white font-bold text-sm py-4 rounded-xl shadow-md mt-4 transition
            ${ucitava ? "bg-gray-400" : "bg-slate-800 hover:bg-slate-700"}`}>
            {ucitava ? "Beleženje..." : "+ Dodaj zapis"}
          </button>
        </form>
      </div>

      {dnevniUnosi.length > 0 && (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Upisano danas</h2>
          <div className="space-y-3">
            {dnevniUnosi.map((unos) => (
              <div key={unos.id} className="bg-gray-50 p-3 rounded-xl text-sm border border-gray-100">
                <div className="font-bold text-slate-700">{unos.vreme}h | Sat: {unos.odometar} km</div>
                <div className="text-gray-500 text-xs mt-1">
                  Wolt: {unos.kmWolt}km | Privatno: {unos.kmPrivatno}km
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
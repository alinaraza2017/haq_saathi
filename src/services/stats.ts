import { getFirebaseApp } from "./firebase";
import type { Urgency } from "../lib/types";

export interface StatRecord {
  category: string;
  city: string;
  urgency: Urgency;
  timestamp: number;
  demo?: boolean;
}

/** Writes ONLY {category, city, urgency, timestamp}. Called only when the user opts in. */
export async function shareStat(r: { category: string; city: string; urgency: Urgency }): Promise<boolean> {
  const app = getFirebaseApp();
  if (!app) return false;
  const { getFirestore, collection, addDoc, serverTimestamp } = await import("firebase/firestore");
  await addDoc(collection(getFirestore(app), "stats"), {
    category: r.category,
    city: r.city,
    urgency: r.urgency,
    timestamp: serverTimestamp(),
  });
  return true;
}

export async function fetchStats(): Promise<StatRecord[]> {
  const app = getFirebaseApp();
  if (!app) return [];
  const { getFirestore, collection, getDocs, query, orderBy, limit } = await import("firebase/firestore");
  const snap = await getDocs(query(collection(getFirestore(app), "stats"), orderBy("timestamp", "desc"), limit(1000)));
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      category: x.category,
      city: x.city,
      urgency: x.urgency,
      timestamp: x.timestamp?.toMillis?.() ?? Date.now(),
    };
  });
}

/** 40 clearly-labelled DEMO records (deterministic, never written to Firestore). */
export const DEMO_STATS: StatRecord[] = (() => {
  const cats = [
    ["workplace_harassment", 9],
    ["domestic_violence", 11],
    ["cyber_harassment", 8],
    ["property_inheritance", 6],
    ["family_maintenance_khula", 4],
    ["street_harassment", 2],
  ] as const;
  const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];
  const out: StatRecord[] = [];
  let i = 0;
  for (const [category, n] of cats) {
    for (let k = 0; k < n; k++, i++) {
      out.push({
        category,
        city: cities[(i * 5 + k) % cities.length],
        urgency: category === "domestic_violence" && k % 3 === 0 ? "emergency" : k % 2 ? "high" : "normal",
        timestamp: Date.UTC(2026, 9, 1 + (i % 30)),
        demo: true,
      });
    }
  }
  return out;
})();

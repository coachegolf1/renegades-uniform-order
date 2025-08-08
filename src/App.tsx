import { useState } from "react";
import logoUrl from "./assets/renegades-logo.png";

// Item preview images
// import altJerseyImg from "./assets/items/alt-jersey.png";
// import awayJerseyImg from "./assets/items/away-jersey.png";
// import homeJerseyImg from "./assets/items/home-jersey.png";
// import homeHatImg from "./assets/items/home-hat.png";
// import awayHatImg from "./assets/items/away-hat.png";
// import practiceJerseyImg from "./assets/items/practice-jersey.png";

// === TEAM BRAND ===
const TEAM_NAME = "WHC Renegades";
const BRAND = {
  primary: "#c80201", // red
  dark: "#010101",
  light: "#ffffff",
  accent: "#000000",
};

// Replace with your deployed Google Apps Script Web App URL:
const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxfw7QiV4apAUj_EtfBIsPGlLogxxGTuQXIDI7xPzmw0Clj3iwaWK-vCUYVJjT4QPmCbQ/exec";

// Default sizes — edit as needed per item
const JERSEY_SIZES = [
  "YS",
  "YM",
  "YL",
  "YXL",
  "AS",
  "AM",
  "AL",
  "AXL",
  "A2XL",
  "A3XL",
];

// Fitted hat sizes
const HAT_SIZES = [
  "6 3/4",
  "6 7/8",
  "7",
  "7 1/8",
  "7 1/4",
  "7 3/8",
  "7 1/2",
  "7 5/8",
  "7 3/4",
  "7 7/8",
  "8",
];

type ItemDef = {
  key: string;
  label: string;
  sizes: string[];
  defaultQty: number;
  lockQty: boolean;
  image?: string;
};

const ITEMS: ItemDef[] = [
  { key: "homeJersey",  label: "Home Jersey",       sizes: JERSEY_SIZES, defaultQty: 1, lockQty: false, image: undefined },
  { key: "awayJersey",  label: "Away Jersey",       sizes: JERSEY_SIZES, defaultQty: 1, lockQty: false, image: undefined },
  { key: "altJersey",   label: "Alternate Jersey",  sizes: JERSEY_SIZES, defaultQty: 1, lockQty: false, image: undefined },
  { key: "homeHat",     label: "Home Hat",          sizes: HAT_SIZES,    defaultQty: 1, lockQty: false, image: undefined },
  { key: "awayHat",     label: "Away Hat",          sizes: HAT_SIZES,    defaultQty: 1, lockQty: false, image: undefined },
  { key: "practiceJersey", label: "Practice Jersey (x2)", sizes: JERSEY_SIZES, defaultQty: 2, lockQty: true, image: undefined },
];

type OrderState = Record<string, { size: string; qty: number }>;

// Top of file (module scope), above `export default function App()`
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function App() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [player, setPlayer] = useState({
    firstName: "",
    lastName: "",
    team: "",
    email: "",
    phone: "",
    confirmNoEdit: false,
  });

  const [order, setOrder] = useState<OrderState>(
    Object.fromEntries(
      ITEMS.map((it) => [it.key, { size: it.sizes[0] ?? "", qty: it.defaultQty }])
    ) as OrderState
  );

  const [lightbox, setLightbox] = useState<string | null>(null);

  const qtyOptions = Array.from({ length: 6 }, (_, i) => i); // 0–5

  const validEmail = (email: string) => /.+@.+\..+/.test(email);
  const validPhone = (phone: string) => /[\d\-\s().+]{7,}/.test(phone);

  const validate = () => {
    if (!player.firstName.trim() || !player.lastName.trim())
      return "Player name is required.";
    if (!validEmail(player.email)) return "Please enter a valid email.";
    if (!validPhone(player.phone)) return "Please enter a valid phone number.";
    if (!player.confirmNoEdit)
      return "Please confirm you understand submissions cannot be edited.";
    for (const it of ITEMS) {
      const { qty } = order[it.key];
      if (it.lockQty && qty !== it.defaultQty)
        return `${it.label} must be quantity ${it.defaultQty}.`;
      if (!it.lockQty && qty < 0)
        return `${it.label} quantity cannot be negative.`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...player,
        timestamp: new Date().toISOString(),
        items: ITEMS.map((it) => ({
          key: it.key,
          label: it.label,
          size: order[it.key].size,
          qty: order[it.key].qty,
        })),
      };

      // const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        // method: "POST",
        // headers: { "Content-Type": "application/json" },
        // body: JSON.stringify(payload),
        // redirect: "follow",
      // });
	  const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" }, // <- key!
  body: JSON.stringify(payload),
});

      if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // const Field = ({
    // label,
    // children,
  // }: {
    // label: string;
    // children: React.ReactNode;
  // }) => (
    // <label className="block mb-4">
      // <span className="block text-sm font-medium text-neutral-700">{label}</span>
      // <div className="mt-1">{children}</div>
    // </label>
  // );

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: BRAND.light }}>
        <div className="max-w-xl w-full bg-white rounded-2xl shadow p-8 text-center border" style={{ borderColor: BRAND.primary }}>
          <img src={logoUrl} alt="Renegades" className="mx-auto h-14 w-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND.primary }}>
            {TEAM_NAME} Uniform Order
          </h1>
          <p className="mb-4">
            Thanks! Your order has been submitted. A confirmation has been sent to the coaching staff.
          </p>
          <p className="text-sm text-neutral-500">
            If you need to make a change, contact your coach directly to submit a correction.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: BRAND.light }}>
      <header className="py-8 bg-white">
        <div className="max-w-3xl mx-auto px-6 flex items-center gap-4">
          <img src={logoUrl} alt="Renegades Logo" className="h-16 w-auto" />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND.primary }}>
              {TEAM_NAME} — Uniform Order
            </h1>
            <p className="text-sm text-neutral-500">
              All players must submit sizes and quantities. Practice Jersey quantity is fixed at 2.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-16">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 border" style={{ borderColor: BRAND.accent }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND.dark }}>Player & Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Player First Name">
              <input className="w-full rounded-xl border p-2" value={player.firstName}
                     onChange={(e) => setPlayer({ ...player, firstName: e.target.value })} required />
            </Field>
            <Field label="Player Last Name">
              <input className="w-full rounded-xl border p-2" value={player.lastName}
                     onChange={(e) => setPlayer({ ...player, lastName: e.target.value })} required />
            </Field>
            <Field label="Team / Age Group (optional)">
              <input className="w-full rounded-xl border p-2" value={player.team}
                     onChange={(e) => setPlayer({ ...player, team: e.target.value })} placeholder="11U, 12U, etc." />
            </Field>
            <Field label="POC Email">
              <input type="email" className="w-full rounded-xl border p-2" value={player.email}
                     onChange={(e) => setPlayer({ ...player, email: e.target.value })} required />
            </Field>
            <Field label="POC Phone">
              <input type="tel" className="w-full rounded-xl border p-2" value={player.phone}
                     onChange={(e) => setPlayer({ ...player, phone: e.target.value })} required />
            </Field>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: BRAND.dark }}>Uniform Items</h2>
          <div className="grid grid-cols-1 gap-4">
            {ITEMS.map((it) => (
              <div key={it.key} className="border rounded-xl p-4 grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr] gap-3">
                <div className="flex items-start gap-3">
                  {it.image && (
                    <button
                      type="button"
                      onClick={() => setLightbox(it.image!)}
                      className="shrink-0 border rounded-lg overflow-hidden"
                      title="Click to enlarge"
                      aria-label={`Preview of ${it.label}`}
                    >
                      <img src={it.image} alt={`${it.label} preview`} className="h-16 w-16 object-cover" />
                    </button>
                  )}
                  <div>
                    <div className="font-medium">{it.label}</div>
                    <div className="text-xs text-neutral-500">Select size and quantity</div>
                  </div>
                </div>
                <div>
                  <Field label="Size">
                    <select className="w-full rounded-xl border p-2"
                            value={order[it.key].size}
                            onChange={(e) => setOrder({ ...order, [it.key]: { ...order[it.key], size: e.target.value } })}>
                      {it.sizes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div>
                  <Field label={`Quantity${it.lockQty ? " (fixed)" : ""}`}>
                    <select className="w-full rounded-xl border p-2"
                            value={order[it.key].qty}
                            onChange={(e) => setOrder({ ...order, [it.key]: { ...order[it.key], qty: parseInt(e.target.value, 10) } })}
                            disabled={it.lockQty}>
                      {qtyOptions.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2">
            <input id="noedit" type="checkbox" className="mt-1"
                   checked={player.confirmNoEdit}
                   onChange={(e) => setPlayer({ ...player, confirmNoEdit: e.target.checked })} />
            <label htmlFor="noedit" className="text-sm">
              I understand submissions <span className="font-semibold">cannot be edited</span>.
              For any corrections, I will contact the coach directly.
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl text-sm border"
                 style={{ borderColor: BRAND.primary, color: BRAND.primary }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
                  className="mt-6 w-full rounded-xl py-3 font-semibold shadow"
                  style={{ background: BRAND.primary, color: BRAND.light }}>
            {submitting ? "Submitting..." : "Submit Order"}
          </button>

          <p className="text-xs text-neutral-500 mt-3">
            Having trouble? Email the coach at coachegolf1@gmail.com
          </p>
        </form>
      </main>

      <footer className="py-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {TEAM_NAME}
      </footer>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <img src={lightbox} alt="Item preview" className="max-h-[90vh] max-w-[90vw] rounded-xl shadow" />
        </div>
      )}
    </div>
  );
}

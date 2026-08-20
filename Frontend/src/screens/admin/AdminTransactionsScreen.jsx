import { useState } from "react";
import { Search } from "lucide-react";
import { T, MONO } from "../../lib/theme.jsx";
import { money, shortDate } from "../../lib/format.js";
import { TextInput, StatusPill } from "../../components/primitives.jsx";
import { useStore } from "../../store/context.jsx";

export default function AdminTransactionsScreen() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const items = state.admin.transactions.filter(
    (t) => t.user.toLowerCase().includes(q.toLowerCase()) || t.id.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 heha-rise">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Transactions</div>
          <div className="text-sm" style={{ color: T.muted }}>{state.admin.transactions.length} total</div>
        </div>
        <div className="relative">
          <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: T.faint }} />
          <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transactions…" style={{ paddingLeft: 32, width: 220 }} />
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.line}`, background: T.surface }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.paper }}>
              {["ID", "User", "Corridor", "Amount", "Revenue", "Status", "Date"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: T.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} style={{ borderTop: `1px solid ${T.line}` }}>
                <td className="px-4 py-3" style={{ fontFamily: MONO, fontSize: 12 }}>{t.id}</td>
                <td className="px-4 py-3">{t.user}</td>
                <td className="px-4 py-3">{t.corridor}</td>
                <td className="px-4 py-3">{money(t.amount)}</td>
                <td className="px-4 py-3">{money(t.fee + t.spreadRevenue)}</td>
                <td className="px-4 py-3"><StatusPill status={t.status} /></td>
                <td className="px-4 py-3 text-xs" style={{ color: T.faint }}>{shortDate(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

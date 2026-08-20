import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { T } from "../../lib/theme.jsx";
import { money } from "../../lib/format.js";
import { TextInput, StatusPill } from "../../components/primitives.jsx";
import { useStore } from "../../store/context.jsx";
import { api } from "../../lib/api.js";

export default function AdminUsersScreen() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState("");
  const users = state.admin.users.filter(
    (u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())
  );

  const toggleStatus = async (u) => {
    const status = u.status === "active" ? "suspended" : "active";
    await api.adminUpdateUser(u.id, { status });
    dispatch({ type: "admin/userUpdated", payload: { id: u.id, patch: { status } } });
  };

  const remove = async (id) => {
    await api.adminDeleteUser(id);
    dispatch({ type: "admin/userDeleted", payload: id });
  };

  return (
    <div className="flex flex-col gap-5 heha-rise">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Users</div>
          <div className="text-sm" style={{ color: T.muted }}>{state.admin.users.length} accounts</div>
        </div>
        <div className="relative">
          <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: T.faint }} />
          <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users…" style={{ paddingLeft: 32, width: 220 }} />
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.line}`, background: T.surface }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.paper }}>
              {["User", "Country", "Balance", "KYC", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: T.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: `1px solid ${T.line}` }}>
                <td className="px-4 py-3">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs" style={{ color: T.faint }}>{u.email}</div>
                </td>
                <td className="px-4 py-3">{u.country}</td>
                <td className="px-4 py-3">{money(u.balance)}</td>
                <td className="px-4 py-3"><StatusPill status={u.kyc} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(u)} className="text-xs font-semibold capitalize" style={{ color: u.status === "active" ? T.pine : T.brick }}>
                    {u.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(u.id)} style={{ color: T.faint }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

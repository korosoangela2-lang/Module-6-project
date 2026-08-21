import { useNavigate } from "react-router-dom";
import { Wallet, Plus, Send } from "lucide-react";
import { T, inputStyle } from "../lib/theme.jsx";
import { Button } from "./primitives.jsx";
import { useStore } from "../store/context.jsx";
import { select } from "../store/selectors.js";
import { money, initials } from "../lib/format.js";

export default function Sidebar() {
  const navigate = useNavigate();
  const { state } = useStore();
  const user = select.user(state);
  const balance = select.balance(state);

  return (
    <aside className="heha-sidebar px-4 py-6 hidden sm:flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: T.pine,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {initials(user?.name)}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: T.ink }}>
            {user?.name?.split(" ")[0] || "You"}
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>{user?.email}</div>
        </div>
      </div>

      <div className="heha-card">
        <div className="text-xs" style={{ color: T.muted }}>
          Available balance
        </div>
        <div className="text-lg font-semibold mt-2" style={{ color: T.ink }}>
          {money(balance)}
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            full
            icon={Plus}
            onClick={() => navigate("/add-funds")}
          >
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate("/send")}>
            <Send size={14} />
          </Button>
        </div>
      </div>

      <div className="heha-card">
        <div className="text-xs font-semibold" style={{ color: T.muted }}>
          Quick actions
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <button
            className="flex items-center gap-3 p-2 rounded-md"
            style={{ textAlign: "left", color: T.ink }}
            onClick={() => navigate("/beneficiaries")}
          >
            <Wallet size={16} /> Manage recipients
          </button>
          <button
            className="flex items-center gap-3 p-2 rounded-md"
            style={{ textAlign: "left", color: T.ink }}
            onClick={() => navigate("/transactions")}
          >
            <Wallet size={16} /> View transactions
          </button>
        </div>
      </div>
    </aside>
  );
}

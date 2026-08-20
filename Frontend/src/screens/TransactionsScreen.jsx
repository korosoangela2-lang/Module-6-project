import { useNavigate } from "react-router-dom";
import { T } from "../lib/theme.jsx";
import { ScreenHeader, TxRow } from "../components/primitives.jsx";
import { useStore } from "../store/context.jsx";
import { select } from "../store/selectors.js";

export default function TransactionsScreen() {
  const { state } = useStore();
  const navigate = useNavigate();
  const items = select.transactions(state);
  return (
    <ScreenHeader title="Transaction history" onBack={() => navigate("/home")}>
      <div className="flex flex-col gap-2 p-5 pt-2">
        {items.length === 0 && <div className="text-sm text-center py-10" style={{ color: T.faint }}>No transactions yet.</div>}
        {items.map((t) => <TxRow key={t.id} tx={t} onClick={() => navigate(`/receipt/${t.id}`)} />)}
      </div>
    </ScreenHeader>
  );
}

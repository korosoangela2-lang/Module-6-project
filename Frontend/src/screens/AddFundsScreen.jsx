import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Smartphone } from "lucide-react";
import { T, inputStyle } from "../lib/theme.jsx";
import { money } from "../lib/format.js";
import { Button, TextInput, Field, ScreenHeader } from "../components/primitives.jsx";
import { useStore } from "../store/context.jsx";
import { select } from "../store/selectors.js";
import { api } from "../lib/api.js";
import { initiateStkPush, pollStkPushStatus } from "../lib/mpesa.js";

const SOURCES = ["Visa ·1042", "Interac", "Mastercard ·7731", "M-Pesa"];

export default function AddFundsScreen() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const userId = select.user(state)?.id;
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState(SOURCES[0]);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(null); // null | "awaiting-phone" | "confirming"
  const [error, setError] = useState(null);
  const isMpesa = source === "M-Pesa";

  const credit = async (creditSource) => {
    const tx = await api.addFunds(userId, { amount: Number(amount), source: creditSource });
    dispatch({ type: "wallet/fundsAdded", payload: tx });
    dispatch({ type: "ui/toastShown", payload: { message: `${money(Number(amount))} added to your wallet` } });
    navigate("/home");
  };

  const submitCard = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await credit(source);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitMpesa = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null); setStage("awaiting-phone");
    try {
      const { checkoutRequestId } = await initiateStkPush(phone, amount);
      setStage("confirming");
      const result = await pollStkPushStatus(checkoutRequestId);
      if (result.status !== "completed") {
        throw new Error(result.resultDesc || "The M-Pesa payment was not completed.");
      }
      await credit(`M-Pesa · ${result.mpesaReceiptNumber || phone}`);
    } catch (err) {
      setError(err.message);
      setStage(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenHeader title="Add funds" onBack={() => navigate("/home")}>
      <form className="flex flex-col gap-4 p-5" onSubmit={isMpesa ? submitMpesa : submitCard}>
        <Field label="Amount (CAD)">
          <TextInput type="number" min="1" step="0.01" required disabled={stage === "confirming"} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </Field>
        <Field label="Funding source">
          <select value={source} disabled={stage === "confirming"} onChange={(e) => { setSource(e.target.value); setError(null); }} style={inputStyle}>
            {SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>

        {isMpesa && (
          <Field label="M-Pesa phone number">
            <TextInput required disabled={stage === "confirming"} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" />
          </Field>
        )}

        {stage === "confirming" && (
          <div className="flex items-center gap-2 text-xs rounded-xl p-3" style={{ background: T.pineSoft, color: T.pine }}>
            <Smartphone size={16} />
            Check your phone and enter your M-Pesa PIN to confirm.
          </div>
        )}

        {error && <div className="text-xs" style={{ color: T.brick }}>{error}</div>}

        <Button type="submit" full loading={busy} icon={isMpesa ? Smartphone : Plus}>
          {isMpesa
            ? (stage === "confirming" ? "Waiting for confirmation…" : "Send STK push")
            : `Add ${amount ? money(Number(amount)) : "funds"}`}
        </Button>
      </form>
    </ScreenHeader>
  );
}

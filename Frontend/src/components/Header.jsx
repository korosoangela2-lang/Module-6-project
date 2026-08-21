import { Link } from "react-router-dom";
import { Home, Send, CreditCard, User } from "lucide-react";
import { T } from "../lib/theme.jsx";

export default function Header() {
  return (
    <header
      className="heha-rise site-header"
      style={{ borderBottom: `1px solid ${T.line}`, background: "transparent" }}
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: T.pine,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div style={{ fontWeight: 700, color: T.ink }}>Heha</div>
        </Link>

        <nav className="hidden sm:flex items-center gap-4">
          <Link
            to="/home"
            className="flex items-center gap-2 text-sm"
            style={{ color: T.ink80 }}
          >
            <Home size={16} />
            Home
          </Link>
          <Link
            to="/send"
            className="flex items-center gap-2 text-sm"
            style={{ color: T.ink80 }}
          >
            <Send size={16} />
            Send
          </Link>
          <Link
            to="/transactions"
            className="flex items-center gap-2 text-sm"
            style={{ color: T.ink80 }}
          >
            <CreditCard size={16} />
            Transactions
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2 text-sm"
            style={{ color: T.ink80 }}
          >
            <User size={16} />
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}

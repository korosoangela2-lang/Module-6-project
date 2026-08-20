import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Send, Receipt, User } from "lucide-react";
import { T } from "../lib/theme.jsx";

const USER_NAV = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/beneficiaries", label: "People", icon: Users },
  { path: "/send", label: "Send", icon: Send },
  { path: "/transactions", label: "History", icon: Receipt },
  { path: "/profile", label: "Profile", icon: User },
];

export default function UserShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const showNav = !pathname.startsWith("/receipt");

  return (
    <div className="flex flex-col flex-1" style={{ minHeight: 0 }}>
      <div className="heha-scroll flex-1 overflow-y-auto">
        <Outlet />
      </div>
      {showNav && (
        <div className="flex items-stretch" style={{ borderTop: `1px solid ${T.line}`, background: T.surface }}>
          {USER_NAV.map(({ path, label, icon: Icon }) => {
            const active = pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5"
                style={{ color: active ? T.pine : T.faint }}
              >
                <Icon size={19} strokeWidth={active ? 2.4 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

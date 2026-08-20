import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Receipt, TrendingUp, LogOut, Loader2 } from "lucide-react";
import { T } from "../../lib/theme.jsx";
import { Button } from "../../components/primitives.jsx";
import { useStore } from "../../store/context.jsx";
import { api } from "../../lib/api.js";

const ADMIN_NAV = [
  { path: "/admin", label: "Overview", icon: Home },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/transactions", label: "Transactions", icon: Receipt },
  { path: "/admin/revenue", label: "Revenue", icon: TrendingUp },
];

export default function AdminShell() {
  const { state, dispatch } = useStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.admin.status === "idle") {
      api.adminData().then((d) => dispatch({ type: "admin/dataReceived", payload: d }));
    }
  }, [state.admin.status]);

  const logout = async () => {
    await api.logout();
    dispatch({ type: "auth/loggedOut" });
    navigate("/login", { replace: true });
  };

  if (state.admin.status !== "succeeded") {
    return (
      <div className="flex items-center justify-center" style={{ height: "100vh" }}>
        <Loader2 className="heha-spin" size={22} style={{ color: T.pine }} />
      </div>
    );
  }

  return (
    <div className="flex" style={{ minHeight: "100vh" }}>
      <div className="flex flex-col gap-1 p-4" style={{ width: 216, borderRight: `1px solid ${T.line}`, background: T.surface }}>
        <div className="text-lg font-semibold px-2 pb-4" style={{ color: T.pine }}>Heha Admin</div>
        {ADMIN_NAV.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left"
            style={{ background: pathname === path ? T.pineSoft : "transparent", color: pathname === path ? T.pine : T.ink80 }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
        <div className="mt-auto px-2 pt-4">
          <Button variant="ghost" size="sm" full icon={LogOut} onClick={logout}>Log out</Button>
        </div>
      </div>
      <div className="heha-scroll flex-1 overflow-y-auto p-8">
        <Outlet />
      </div>
    </div>
  );
}

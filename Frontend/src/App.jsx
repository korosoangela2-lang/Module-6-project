import { useEffect, useMemo, useReducer } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { Loader2 } from "lucide-react";

import { GlobalStyle, SANS, T } from "./lib/theme.jsx";
import Header from "./components/Header.jsx";
import { api } from "./lib/api.js";
import { reducer, initialState } from "./store/reducer.js";
import { select } from "./store/selectors.js";
import { Store, useStore } from "./store/context.jsx";
import { Toast } from "./components/primitives.jsx";

import LoginScreen from "./screens/LoginScreen.jsx";
import RegisterScreen from "./screens/RegisterScreen.jsx";
import UserShell from "./screens/UserShell.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import AddFundsScreen from "./screens/AddFundsScreen.jsx";
import BeneficiariesScreen from "./screens/BeneficiariesScreen.jsx";
import SendMoneyScreen from "./screens/SendMoneyScreen.jsx";
import TransactionsScreen from "./screens/TransactionsScreen.jsx";
import ReceiptScreen from "./screens/ReceiptScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import AdminShell from "./screens/admin/AdminShell.jsx";
import AdminOverviewScreen from "./screens/admin/AdminOverviewScreen.jsx";
import AdminUsersScreen from "./screens/admin/AdminUsersScreen.jsx";
import AdminTransactionsScreen from "./screens/admin/AdminTransactionsScreen.jsx";
import AdminRevenueScreen from "./screens/admin/AdminRevenueScreen.jsx";

function LoadingScreen() {
  return (
    <div
      className="flex items-center justify-center flex-1"
      style={{ minHeight: "100%" }}
    >
      <Loader2 className="heha-spin" size={22} style={{ color: T.pine }} />
    </div>
  );
}

function RootRedirect() {
  const { state } = useStore();
  if (state.auth.restoring) return <LoadingScreen />;
  if (!state.auth.token) return <Navigate to="/login" replace />;
  return <Navigate to={select.isAdmin(state) ? "/admin" : "/home"} replace />;
}

function PublicOnly() {
  const { state } = useStore();
  if (state.auth.restoring) return <LoadingScreen />;
  if (state.auth.token)
    return <Navigate to={select.isAdmin(state) ? "/admin" : "/home"} replace />;
  return <Outlet />;
}

function RequireAuth({ role }) {
  const { state } = useStore();
  if (state.auth.restoring) return <LoadingScreen />;
  if (!state.auth.token) return <Navigate to="/login" replace />;
  const isAdmin = select.isAdmin(state);
  if (role === "admin" && !isAdmin) return <Navigate to="/home" replace />;
  if (role === "user" && isAdmin) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

function AppShell() {
  const { state } = useStore();
  const isAdmin = select.isAdmin(state);
  const signedIn = Boolean(state.auth.token);
  const fullWidth = isAdmin && signedIn;

  return (
    <div
      className="heha flex min-h-screen w-full justify-center"
      style={{
        background: fullWidth ? T.paper : "#E7EAE9",
        fontFamily: SANS,
        color: T.ink,
      }}
    >
      {fullWidth ? (
        <div className="w-full">
          <Outlet />
        </div>
      ) : (
        <div
          className="heha-phone"
          style={{
            background: T.paper,
            color: T.ink,
            boxShadow: "0 8px 30px rgba(18,22,31,0.06)",
          }}
        >
          <Header />
          <main className="heha-container">
            <Outlet />
          </main>
        </div>
      )}
      <Toast />
    </div>
  );
}

/** Login/register don't manage their own scroll region (unlike UserShell), so they get one here. */
function AuthLayout() {
  return (
    <div className="heha-scroll flex-1 overflow-y-auto">
      <Outlet />
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const store = useMemo(() => ({ state, dispatch }), [state]);

  useEffect(() => {
    api.rates().then((r) => dispatch({ type: "rates/received", payload: r }));
    api.restoreSession().then((res) => {
      if (res) dispatch({ type: "auth/sessionStarted", payload: res });
      else dispatch({ type: "auth/restoreFinished" });
    });
  }, []);

  return (
    <Store.Provider value={store}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<RootRedirect />} />

            <Route element={<PublicOnly />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/register" element={<RegisterScreen />} />
              </Route>
            </Route>

            <Route element={<RequireAuth role="user" />}>
              <Route element={<UserShell />}>
                <Route path="/home" element={<HomeScreen />} />
                <Route path="/add-funds" element={<AddFundsScreen />} />
                <Route
                  path="/beneficiaries"
                  element={<BeneficiariesScreen />}
                />
                <Route path="/send" element={<SendMoneyScreen />} />
                <Route path="/transactions" element={<TransactionsScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/receipt/:id" element={<ReceiptScreen />} />
              </Route>
            </Route>

            <Route element={<RequireAuth role="admin" />}>
              <Route path="/admin" element={<AdminShell />}>
                <Route index element={<AdminOverviewScreen />} />
                <Route path="users" element={<AdminUsersScreen />} />
                <Route
                  path="transactions"
                  element={<AdminTransactionsScreen />}
                />
                <Route path="revenue" element={<AdminRevenueScreen />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Store.Provider>
  );
}

export const T = {
  ink: "#12161F",
  ink80: "#2A3040",
  paper: "#F1F3F2",
  surface: "#FFFFFF",
  line: "#DFE3E1",
  pine: "#0A5F4F",
  pineSoft: "#E4F0EC",
  marigold: "#F2A93B",
  marigoldSoft: "#FDF1DC",
  brick: "#B3392C",
  brickSoft: "#F8E7E4",
  muted: "#5C6670",
  faint: "#8A939B",
};

export const SANS = "'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
export const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, 'Roboto Mono', monospace";

export const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
    .heha * { box-sizing: border-box; }
    .heha button { font-family: inherit; cursor: pointer; }
    .heha input, .heha select { font-family: inherit; }
    .heha :focus-visible { outline: 2px solid ${T.marigold}; outline-offset: 2px; border-radius: 4px; }
    .heha input::placeholder { color: ${T.faint}; }
    .heha-phone { display: flex; flex-direction: column; width: 100%; flex: 1; }
    @media (min-width: 640px) {
      .heha-phone {
        width: 418px; height: 860px; max-height: 92vh; flex: none;
        margin: 24px 0; border-radius: 26px; overflow: hidden;
      }
    }
    .heha-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .heha-scroll::-webkit-scrollbar-thumb { background: ${T.line}; border-radius: 99px; }
    @keyframes heha-tick { 0% { opacity: .35; transform: translateY(-2px); } 100% { opacity: 1; transform: none; } }
    @keyframes heha-rise { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: none; } }
    @keyframes heha-spin { to { transform: rotate(360deg); } }
    @keyframes heha-crawl { to { background-position: 14px 0; } }
    .heha-tick { animation: heha-tick .28s ease-out; }
    .heha-rise { animation: heha-rise .3s ease-out both; }
    .heha-spin { animation: heha-spin .9s linear infinite; }
    @media (prefers-reduced-motion: reduce) {
      .heha *, .heha *::before, .heha *::after { animation: none !important; transition: none !important; }
    }
  `}</style>
);

export const inputStyle = { background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, color: T.ink, width: "100%" };

export const TONE = {
  pine: { bg: T.pineSoft, fg: T.pine },
  marigold: { bg: T.marigoldSoft, fg: "#8A5A0F" },
  brick: { bg: T.brickSoft, fg: T.brick },
  muted: { bg: T.paper, fg: T.muted },
};

export const STATUS_TONE = {
  completed: "pine", active: "pine", verified: "pine",
  pending: "marigold",
  failed: "brick", suspended: "brick", rejected: "brick",
  unverified: "muted",
};


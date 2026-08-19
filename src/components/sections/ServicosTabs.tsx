import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Eye } from "lucide-react";

const tabs = [
  {
    path: "/servicos",
    label: "Nossos Serviços",
    hint: "O que fazemos",
    icon: LayoutGrid,
  },
  {
    path: "/servicos/na-pratica",
    label: "Serviços na Prática",
    hint: "Como fica na prática",
    icon: Eye,
  },
];

export function ServicosTabs() {
  const location = useLocation();

  return (
    <div className="sticky top-16 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`group flex items-center gap-3 rounded-xl border px-5 py-3 transition-all duration-300 ${
                  isActive
                    ? "border-primary bg-primary text-white shadow-elegant"
                    : "border-border/60 bg-card text-foreground hover:border-primary/40 hover:-translate-y-0.5"
                }`}
              >
                <span
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive ? "bg-white/15" : "bg-primary/10 group-hover:bg-primary/20"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-primary"}`} />
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-sm font-semibold">{tab.label}</span>
                  <span
                    className={`block text-xs ${
                      isActive ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {tab.hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

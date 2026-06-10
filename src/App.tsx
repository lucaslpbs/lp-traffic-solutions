import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/sections/modern-header";
import { Footer } from "@/components/sections/Footer";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/dashboard/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Cases from "./pages/Cases";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsConditions";
import BrindeLanding from "./pages/BrindeLanding";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientReport from "./pages/ClientReport";
import WarRoom from "./pages/WarRoom";
import GestaoClientes from "./pages/GestaoClientes";
import OrcamentoLV3 from "./pages/OrcamentoLV3";
import OrcamentoLuBrasil from "./pages/OrcamentoLuBrasil";
import NpsDashboard from "./pages/NpsDashboard";
import KoruEngenharia from "./pages/KoruEngenharia";
import KoruCicloVendas from "./pages/KoruCicloVendas";
import KoruVendas from "./pages/KoruVendas";
import OrcamentoOticasVisao from "./pages/OrcamentoOticasVisao";
import LeadsDashboard from "./pages/LeadsDashboard";
import LivetDashboard from "./pages/LivetDashboard.tsx";
import NCSaudeDashboard from "./pages/NCSaudeDashboard.tsx";
import ClaraFashionDashboard from "./pages/ClaraFashionDashboard.tsx";
import FacanhaChickDashboard from "./pages/FacanhaChickDashboard.tsx";
import PropostaPiazzaAldeota from "./pages/proposta-piazza-aldeota/index.jsx";
import Obrigado from "./pages/obrigado";
import DanielMaiaAutomacoes from "./pages/DanielMaiaAutomacoes";
import SandellyAutomacoes from "./pages/SandellyAutomacoes";
import NucleoOftalmologiaDashboard from "./pages/NucleoOftalmologiaDashboard";
import NucleoOftalmologiaDashboardKommo from "./pages/NucleoOftalmologiaDashboardKommo";
import CadastroInstancia from "./pages/CadastroInstancia";

const queryClient = new QueryClient();

// Rotas internas que não mostram Header/Footer
const HIDDEN_PATHS = [
  '/brinde-exclusivo',
  '/orcamento-lv3-multimarcas',
  '/orcamento-lubrasil',
  '/nps-ncsaude',
  '/koru-engenharia',
  '/orcamento-oticasvisao',
  '/leads-dashboard',
  '/proposta-piazza-aldeota',
  '/obrigado',
  '/danielmaiaautomacoes',
  '/sandelly-automacoes',
  '/CadastroInstancia',
  // Dashboards por cliente
  '/livet-dashboard',
  '/ncsaude-dashboard',
  '/clarafashion-dashboard',
  '/facanha-dashboard',
  '/nucleo-oftalmologia',
  '/nucleo-oftalmologia-dashboard',
];

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isLogin = location.pathname === '/login';
  const isHiddenPage = HIDDEN_PATHS.some(
    (path) => location.pathname === path || location.pathname.startsWith(path + '/')
  );

  if (isDashboard || isLogin || isHiddenPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <LayoutWrapper>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/servicos" element={<Services />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsOfService />} />
        <Route path="/brinde-exclusivo" element={<BrindeLanding />} />
        <Route path="/orcamento-lv3-multimarcas" element={<OrcamentoLV3 />} />
        <Route path="/orcamento-lubrasil" element={<OrcamentoLuBrasil />} />
        <Route path="/nps-ncsaude" element={<NpsDashboard />} />
        <Route path="/koru-engenharia" element={<KoruEngenharia />} />
        <Route path="/koru-engenharia/ciclo-vendas" element={<KoruCicloVendas />} />
        <Route path="/koru-engenharia/vendas" element={<KoruVendas />} />
        <Route path="/orcamento-oticasvisao" element={<OrcamentoOticasVisao />} />

        {/* Dashboard geral (todos os clientes) — protegido */}
        <Route path="/leads-dashboard" element={<ProtectedRoute><LeadsDashboard /></ProtectedRoute>} />

        {/* ── Dashboards por cliente — protegidos ── */}
        <Route path="/livet-dashboard" element={<ProtectedRoute><LivetDashboard /></ProtectedRoute>} />
        <Route path="/ncsaude-dashboard" element={<ProtectedRoute><NCSaudeDashboard /></ProtectedRoute>} />
        <Route path="/clarafashion-dashboard" element={<ProtectedRoute><ClaraFashionDashboard /></ProtectedRoute>} />
        <Route path="/facanha-dashboard" element={<ProtectedRoute><FacanhaChickDashboard /></ProtectedRoute>} />
        <Route path="/nucleo-oftalmologia" element={<NucleoOftalmologiaDashboard />} />
        <Route path="/nucleo-oftalmologia-dashboard" element={<NucleoOftalmologiaDashboardKommo />} />

<Route path="/proposta-piazza-aldeota" element={<PropostaPiazzaAldeota />} />
        <Route path="/obrigado" element={<Obrigado />} />
        <Route path="/danielmaiaautomacoes" element={<DanielMaiaAutomacoes />} />
        <Route path="/sandelly-automacoes" element={<SandellyAutomacoes />} />
        <Route path="/CadastroInstancia" element={<CadastroInstancia />} />

        <Route path="/login" element={<Login />} />

        {/* Dashboard interno */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="guerra" element={<WarRoom />} />
          <Route path="gestao-clientes" element={<GestaoClientes />} />
          <Route path=":clientId" element={<ClientReport />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </LayoutWrapper>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
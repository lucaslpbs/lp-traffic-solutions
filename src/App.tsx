import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/sections/modern-header";
import { Footer } from "@/components/sections/Footer"; // 👈 importa o Footer
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Cases from "./pages/Cases";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import BrindeLanding from "./pages/BrindeLanding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          {/* Cabeçalho */}
          <Header />

          {/* Conteúdo principal */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/servicos" element={<Services />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/brinde-exclusivo" element={<BrindeLanding />} />
              {/* rota 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Rodapé */}
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

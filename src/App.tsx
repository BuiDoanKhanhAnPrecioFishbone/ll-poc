import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Home } from './pages/Home';
import { PartMaster } from './pages/PartMaster';
import { Quotations } from './pages/Quotations';
import { QuotationDetail } from './pages/QuotationDetail';
import { SitemapPage } from './pages/Sitemap';
import { DesignSystemPage } from './pages/DesignSystem';
import { AuditPage } from './pages/Audit';
import { Placeholder } from './pages/Placeholder';
import { Navigate } from 'react-router-dom';

/** Preserves the record id when redirecting the old path to the canonical one. */
function RedirectToQuotation() {
  const { id } = useParams();
  return <Navigate to={`/sales-management/quotation/${id}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/parts" element={<PartMaster />} />
          {/* Quotations mirrors the production route exactly, so this mockup and
              the live system can be compared at the same URL. The proposed-IA
              path from the sitemap is kept as a redirect: that is the migration
              this repo recommends for the other six mis-namespaced screens
              (audit finding N3) — move the route, keep the old link working. */}
          <Route path="/sales-management/quotation" element={<Quotations />} />
          <Route path="/sales-management/quotation/:id" element={<QuotationDetail />} />
          <Route path="/sell/quotations" element={<Navigate to="/sales-management/quotation" replace />} />
          <Route path="/sell/quotations/:id" element={<RedirectToQuotation />} />
          <Route path="/sitemap" element={<SitemapPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="*" element={<Placeholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

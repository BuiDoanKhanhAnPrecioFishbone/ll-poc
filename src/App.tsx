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
import { Queues } from './pages/Queues';
import { ToastProvider } from './ui/Toast';
import { Navigate } from 'react-router-dom';

/** Preserves the record id when redirecting the old path to the canonical one. */
function RedirectToQuotation() {
  const { id } = useParams();
  return <Navigate to={`/sales-management/quotation/${id}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <Routes>
        <Route element={<AppShell />}>
          {/* Every route mirrors the production URL exactly, so this mockup and
              the live system can be opened side by side and compared at the same
              address. The proposed-IA paths from the earlier restructure are kept
              as redirects rather than deleted, so any link already shared still
              resolves. */}
          <Route path="/" element={<Home />} />
          <Route path="/my-queues" element={<Queues />} />
          <Route path="/inventory-management/part-mst" element={<PartMaster />} />
          <Route path="/parts" element={<Navigate to="/inventory-management/part-mst" replace />} />
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
      </ToastProvider>
    </BrowserRouter>
  );
}

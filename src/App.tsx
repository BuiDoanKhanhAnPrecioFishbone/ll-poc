import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Home } from './pages/Home';
import { PartMaster } from './pages/PartMaster';
import { Quotations } from './pages/Quotations';
import { QuotationDetail } from './pages/QuotationDetail';
import { SitemapPage } from './pages/Sitemap';
import { DesignSystemPage } from './pages/DesignSystem';
import { AuditPage } from './pages/Audit';
import { Placeholder } from './pages/Placeholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/parts" element={<PartMaster />} />
          <Route path="/sell/quotations" element={<Quotations />} />
          <Route path="/sell/quotations/:id" element={<QuotationDetail />} />
          <Route path="/sitemap" element={<SitemapPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="*" element={<Placeholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

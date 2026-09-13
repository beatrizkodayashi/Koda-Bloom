'use client';

import dynamic from 'next/dynamic';
import { LegacyAppPage } from '@/components/LegacyAppPage';

const Page = dynamic(
  () =>
    import('@/legacy-runtime/pages/necessaire').then((mod) => {
      function ClientPage() {
        return <LegacyAppPage loader={async () => mod.renderNecessaire} />;
      }
      return ClientPage;
    }),
  {
    ssr: false,
    loading: () => <div className="app-shell gradient-bg floral-pattern" />,
  }
);

export default Page;

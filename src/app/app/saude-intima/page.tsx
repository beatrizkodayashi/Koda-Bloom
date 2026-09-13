'use client';

import dynamic from 'next/dynamic';
import { LegacyAppPage } from '@/components/LegacyAppPage';

const Page = dynamic(
  () =>
    import('@/legacy-runtime/pages/intimateHealth').then((mod) => {
      function ClientPage() {
        return <LegacyAppPage loader={async () => mod.renderIntimateHealth} />;
      }
      return ClientPage;
    }),
  {
    ssr: false,
    loading: () => <div className="app-shell gradient-bg floral-pattern" />,
  }
);

export default Page;

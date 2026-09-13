import fs from 'node:fs';
import path from 'node:path';

const pages = [
  ['onboarding', 'onboarding', 'renderOnboarding'],
  ['app/hoje', 'dashboard', 'renderDashboard'],
  ['app/calendario', 'calendar', 'renderCalendar'],
  ['app/registrar', 'tracking', 'renderTracking'],
  ['app/insights', 'insights', 'renderInsights'],
  ['app/meu-padrao', 'myPattern', 'renderMyPattern'],
  ['app/bolsinha', 'necessaire', 'renderNecessaire'],
  ['app/planejador', 'planner', 'renderPlanner'],
  ['app/relatorio', 'doctorReport', 'renderDoctorReport'],
  ['app/isso-e-normal', 'isThisNormal', 'renderIsThisNormal'],
  ['app/relacoes', 'relations', 'renderRelations'],
  ['app/anticoncepcional', 'contraceptive', 'renderContraceptive'],
  ['app/saude-intima', 'intimateHealth', 'renderIntimateHealth'],
  ['app/perfil', 'profile', 'renderProfile'],
  ['app/cuidado', 'careMode', 'renderCareMode'],
];

for (const [route, moduleName, exportName] of pages) {
  const dir = path.join('src/app', route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'page.tsx'),
    `'use client';

import dynamic from 'next/dynamic';
import { LegacyAppPage } from '@/components/LegacyAppPage';

const Page = dynamic(
  () =>
    import('@/legacy-runtime/pages/${moduleName}').then((mod) => {
      function ClientPage() {
        return <LegacyAppPage loader={async () => mod.${exportName}} />;
      }
      return ClientPage;
    }),
  {
    ssr: false,
    loading: () => <div className="app-shell gradient-bg floral-pattern" />,
  }
);

export default Page;
`
  );
}

console.log('regenerated ssr-disabled app routes');

import Link from 'next/link';
import { APP_NAME, HEALTH_DISCLAIMER, ROUTES } from '@/lib/config/app';
import { BrandLogo } from '@/components/BrandLogo';
import { Card } from '@/components/Card';
import { BloomIcon } from '@/components/BloomIcon';

const FEATURES = [
  {
    title: 'Calendário inteligente',
    icon: 'calendar',
    text: 'Visualize menstruação, previsões e janela fértil estimada em um calendário claro.',
  },
  {
    title: 'Check-in diário',
    icon: 'sparkles',
    text: 'Registre humor, sintomas e bem-estar em segundos. Só o que importa para você.',
  },
  {
    title: 'Seus padrões',
    icon: 'target',
    text: 'Descubra tendências nos seus registros. Sem diagnóstico, apenas insights pessoais.',
  },
  {
    title: 'Privacidade',
    icon: 'discrete',
    text: 'Seus dados são seus. Proteção com autenticação e Row Level Security.',
  },
  {
    title: 'Mobile first',
    icon: 'note',
    text: 'Feito para o celular, adaptado para desktop. Instale como app quando quiser.',
  },
];

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="landing-page gradient-bg floral-pattern">
      <header className="landing-nav">
        <span className="landing-brand">
          <BrandLogo modifier="bloom-logo--nav" />
        </span>
        <div className="flex gap-2">
          <Link href={ROUTES.LOGIN} className="btn-bloom btn-bloom-ghost btn-bloom-sm">
            Entrar
          </Link>
          <Link href={ROUTES.SIGNUP} className="btn-bloom btn-bloom-primary btn-bloom-sm">
            Começar
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1>
            Entenda seu ciclo.
            <br />
            Conheça melhor você.
          </h1>
          <p>
            Acompanhe seu ciclo menstrual com carinho, privacidade e clareza. Estimativas baseadas nos
            seus registros, sem julgamentos, sem pressão.
          </p>
          <div className="landing-hero-actions">
            <Link href={ROUTES.SIGNUP} className="btn-bloom btn-bloom-primary btn-bloom-lg">
              Criar conta grátis
            </Link>
            <Link href={ROUTES.LOGIN} className="btn-bloom btn-bloom-secondary btn-bloom-lg">
              Já tenho conta
            </Link>
          </div>
        </div>
        <div className="duck-companion landing-hero-mascot">
          <img
            src="/pato_acenando.png"
            alt={APP_NAME}
            className="bloom-mascot-img bloom-mascot-img--hero"
            width={280}
            height={280}
          />
          <p className="mascot-caption">Oi! Que bom ter você aqui. Vamos conhecer seu ciclo comigo?</p>
        </div>
      </section>

      <section className="landing-section">
        <h2>Como funciona</h2>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <Card key={feature.title} title={feature.title} className="feature-card">
              <BloomIcon name={feature.icon} className="bloom-icon feature-card-icon" />
              <p className="text-muted mb-0">{feature.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section-highlight">
        <h2>{APP_NAME} te acompanha</h2>
        <p className="mb-4 text-center text-muted">
          {APP_NAME} celebra seus registros e te dá dicas gentis, com carinho e leveza.
        </p>
        <div className="duck-companion">
          <img
            src="/pato_na_arvore.png"
            alt={APP_NAME}
            className="bloom-mascot-img bloom-mascot-img--highlight"
            width={240}
            height={240}
          />
          <p className="mascot-caption">Você está florescendo nesta fase do ciclo!</p>
        </div>
      </section>

      <section className="landing-section text-center">
        <h2>Pronta para começar?</h2>
        <p className="mb-4 text-muted">Gratuito. Privado. Feito com cuidado.</p>
        <Link href={ROUTES.SIGNUP} className="btn-bloom btn-bloom-primary btn-bloom-lg">
          Começar agora
        </Link>
        <p className="health-disclaimer mx-auto mt-4" style={{ maxWidth: 600 }}>
          {HEALTH_DISCLAIMER}
        </p>
      </section>

      <footer className="landing-footer">
        <p>
          © {year} {APP_NAME}. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

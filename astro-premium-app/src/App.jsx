import { useState } from "react";
import "./App.css";

const tabs = [
  { id: "home", label: "Accueil", icon: "✦" },
  { id: "profile", label: "Profil", icon: "☽" },
  { id: "love", label: "Amour", icon: "♡" },
  { id: "chart", label: "Carte", icon: "☿" },
  { id: "premium", label: "Premium", icon: "◆" },
];

function DesktopWebVersion() {
  return (
    <main className="desktop-shell">
      <iframe
        className="desktop-frame"
        src="/theme_astral_app_final_v3.html"
        title="ASTRO Premium version web"
      />
    </main>
  );
}

function Header({ active }) {
  const titles = {
    home: "Aperçu gratuit",
    profile: "Profil personnel",
    love: "Amour & relation",
    chart: "Carte natale",
    premium: "Premium",
  };

  return (
    <header className="mobile-header">
      <div>
        <span>ASTRO PREMIUM</span>
        <h1>{titles[active]}</h1>
      </div>
      <button className="header-button">PDF</button>
    </header>
  );
}

function ScoreStrip() {
  return (
    <div className="score-strip">
      <div>
        <span>Amour</span>
        <strong>66%</strong>
      </div>
      <div>
        <span>Émotion</span>
        <strong>64%</strong>
      </div>
      <div>
        <span>Global</span>
        <strong>62%</strong>
      </div>
    </div>
  );
}

function Card({ label, title, children, premium = false }) {
  return (
    <article className={premium ? "card card-premium" : "card"}>
      {label && <span className="label">{label}</span>}
      {premium && <span className="premium-tag">Premium</span>}
      <h2>{title}</h2>
      <p>{children}</p>
    </article>
  );
}

function Home({ go }) {
  return (
    <section className="screen">
      <article className="hero">
        <span className="label">Lecture gratuite</span>
        <h2>Voici les premières clés de votre profil astral.</h2>
        <p>
          Votre carte révèle une sensibilité forte, un besoin de sens et une
          dynamique relationnelle guidée par l’intuition.
        </p>

        <ScoreStrip />

        <button className="primary" onClick={() => go("profile")}>
          Découvrir mon profil gratuit
        </button>
      </article>

      <Card label="Aperçu personnel" title="Ce qui ressort déjà">
        Vous avancez mieux lorsque vos choix ont une direction claire. Votre
        intuition est forte, mais elle doit être canalisée pour devenir une vraie
        force d’action.
      </Card>

      <Card label="Ascendant" title="Poissons">
        Vous captez facilement les ambiances et les non-dits. Votre force est
        votre finesse émotionnelle. Votre vigilance : ne pas porter ce qui ne
        vous appartient pas.
      </Card>

      <Card premium title="Lecture complète verrouillée">
        La version premium débloque votre roue complète, vos planètes, vos
        maisons, vos aspects exacts, votre période actuelle et votre PDF.
      </Card>
    </section>
  );
}

function Profile() {
  return (
    <section className="screen">
      <Card label="Profil" title="Votre moteur intérieur">
        Vous avancez mieux quand vous savez pourquoi vous donnez votre énergie.
        Sans direction claire, vous pouvez vous disperser. Avec une vision, vous
        devenez plus constant, plus créatif et plus puissant.
      </Card>

      <Card label="Émotion" title="Une forte réceptivité">
        Votre sensibilité agit comme un radar. Elle vous aide à comprendre les
        autres rapidement, parfois avant même qu’ils parlent. Elle demande aussi
        des limites nettes pour ne pas vous épuiser.
      </Card>

      <Card label="Travail" title="Besoin d’un horizon">
        Les cadres trop fermés peuvent étouffer votre motivation. Vous avez
        besoin d’un projet qui ouvre : transmettre, créer, apprendre, guider ou
        développer quelque chose qui a du sens.
      </Card>

      <Card premium title="Analyse premium du profil">
        En premium, chaque axe est développé : forces profondes, blocages,
        talents, maison dominante, planètes fortes et conseils personnalisés.
      </Card>
    </section>
  );
}

function Love() {
  return (
    <section className="screen">
      <article className="hero compact">
        <span className="label">Relationnel</span>
        <h2>Votre manière d’aimer demande de la profondeur.</h2>
        <p>
          Vous avez besoin d’une relation vivante, sincère et présente. Le lien
          doit se ressentir, pas seulement se comprendre.
        </p>
        <ScoreStrip />
      </article>

      <Card label="Amour" title="Connexion avant confort">
        Vous pouvez être très engagé quand vous sentez que l’autre vous comprend
        réellement. Sans profondeur, la relation peut vite manquer de présence.
      </Card>

      <Card label="Compatibilité" title="Le signe solaire ne suffit pas">
        Deux personnes peuvent sembler compatibles en signes solaires et pourtant
        être complexes en Lune, Vénus ou Mars. La vraie compatibilité demande une
        synastrie complète.
      </Card>

      <Card premium title="Synastrie premium">
        Comparez deux thèmes : attraction, émotion, communication, tensions,
        long terme, conseils relationnels et aspects exacts entre les deux cartes.
      </Card>
    </section>
  );
}

function Chart() {
  return (
    <section className="screen">
      <Card label="Carte gratuite" title="Votre carte en aperçu">
        La version gratuite montre les grands repères. La roue complète avec
        signes, planètes, maisons et aspects est réservée à la version premium.
      </Card>

      <div className="astro-summary">
        <div>
          <span>ASC</span>
          <strong>Poissons</strong>
          <small>Votre porte d’entrée dans le monde.</small>
        </div>
        <div>
          <span>MC</span>
          <strong>Sagittaire</strong>
          <small>Votre trajectoire publique.</small>
        </div>
        <div>
          <span>Base</span>
          <strong>Placidus</strong>
          <small>Système de maisons utilisé.</small>
        </div>
      </div>

      <article className="locked-wheel">
        <span className="label">Carte complète premium</span>
        <div className="wheel-teaser">
          <span>☉</span>
          <span>☽</span>
          <span>♀️</span>
          <span>♂️</span>
          <span>♃</span>
        </div>
        <h2>Débloquez la roue complète</h2>
        <p>
          Signes, planètes, maisons, axes, aspects exacts et interprétation
          détaillée dans une carte premium lisible.
        </p>
        <button className="primary">Débloquer la carte complète</button>
      </article>
    </section>
  );
}

function Offer({ tag, title, price, children, featured = false }) {
  return (
    <article className={featured ? "offer featured" : "offer"}>
      <span>{tag}</span>
      <h2>{title}</h2>
      <strong>{price}</strong>
      <p>{children}</p>
      <button>Choisir</button>
    </article>
  );
}

function Premium() {
  return (
    <section className="screen">
      <article className="hero compact">
        <span className="label">Offres premium</span>
        <h2>Débloquez votre lecture complète.</h2>
        <p>
          Votre aperçu gratuit donne les premières clés. Le premium transforme
          votre thème en rapport complet, personnel et exploitable.
        </p>
      </article>

      <Offer tag="Base premium" title="Thème personnel" price="4,99 €">
        Profil complet, amour, travail, énergie, forces, vigilance et période
        actuelle.
      </Offer>

      <Offer tag="Relation" title="Compatibilité" price="6,99 €">
        Synastrie détaillée avec une personne : attraction, émotion,
        communication et long terme.
      </Offer>

      <Offer tag="Meilleure valeur" title="Pack complet" price="9,99 €" featured>
        Thème personnel + compatibilité + carte complète + PDF premium.
      </Offer>

      <article className="premium-proof">
        <h2>Inclus dans le premium</h2>
        <ul>
          <li>Roue complète : signes, planètes, maisons et axes</li>
          <li>Aspects exacts hiérarchisés</li>
          <li>Analyse amour, travail, énergie et période actuelle</li>
          <li>Compatibilité détaillée avec une autre personne</li>
          <li>PDF premium prêt à conserver</li>
        </ul>
      </article>
    </section>
  );
}

function MobileApp() {
  const [active, setActive] = useState("home");

  return (
    <div className="mobile-app">
      <Header active={active} />

      <main className="mobile-content">
        {active === "home" && <Home go={setActive} />}
        {active === "profile" && <Profile />}
        {active === "love" && <Love />}
        {active === "chart" && <Chart />}
        {active === "premium" && <Premium />}
      </main>

      <nav className="bottom-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={active === tab.id ? "active" : ""}
            onClick={() => setActive(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <>
      <div className="desktop-only">
        <DesktopWebVersion />
      </div>

      <div className="mobile-only">
        <MobileApp />
      </div>
    </>
  );
}
import { MotionConfig } from "motion/react";
import { AccessStory } from "./components/AccessStory";
import { Improvements, Learnings } from "./components/Changes";
import { Commitment, Footer, Methodology } from "./components/Commitment";
import { DataSection } from "./components/DataSection";
import { Discovery } from "./components/Discovery";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
// import { Solutions } from "./components/Solutions"; // seção oculta a pedido (componente mantido)
import { Timeline } from "./components/Timeline";
import { Starfield } from "./components/ui";
import { Olympics, WhatHappened } from "./components/WhatHappened";

/**
 * Progressão narrativa: curiosidade → contexto → reconhecimento → entendimento → ação
 * → processo → mudança → aprendizado → continuidade.
 */
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a href="#aconteceu" className="skip-link">
        Pular para o conteúdo
      </a>
      {/* céu fixo atrás das seções escuras */}
      <div aria-hidden="true" className="fixed inset-0 -z-20 bg-space-900">
        <Starfield density={0.55} drift={false} />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_85%_20%,rgba(79,70,229,.12),transparent_70%),radial-gradient(60%_50%_at_5%_80%,rgba(14,116,144,.12),transparent_70%)]" />
      </div>
      <Nav />
      <main id="conteudo">
        <Hero />
        <WhatHappened />
        <Olympics />
        <DataSection />
        <Discovery />
        <AccessStory />
        {/* <Solutions /> seção "Do problema à solução" oculta */}
        <Timeline />
        <Improvements />
        <Learnings />
        <Commitment />
        <Methodology />
      </main>
      <Footer />
    </MotionConfig>
  );
}

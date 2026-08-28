import { useEffect } from 'react';
import { Scene } from './Scene';

export default function App() {
  useEffect(() => {
    // Motion-gated scroll & deck effects
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear().toString();

    if (!reduced) {
      document.documentElement.classList.add("motion");
      initPortal();
      initReveal();
      initStatementDrift();
    }
    initDeck();

    function initPortal() {
      const portal = document.querySelector(".portal") as HTMLElement;
      const stage = document.querySelector(".portal-stage") as HTMLElement;
      if (!portal || !stage) return;
      let ticking = false;

      function apply() {
        ticking = false;
        const rect = portal.getBoundingClientRect();
        const dist = portal.offsetHeight - window.innerHeight;
        const p = dist > 0 ? clamp(-rect.top / dist, 0, 1) : 0;
        stage.style.setProperty("--p", p.toFixed(4));
      }
      function onScroll() {
        if (!ticking) { ticking = true; requestAnimationFrame(apply); }
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", apply);
      apply();
    }

    function initReveal() {
      const els = document.querySelectorAll(".reveal");
      if (!("IntersectionObserver" in window)) {
        els.forEach((el) => el.classList.add("in"));
        return;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      els.forEach((el) => io.observe(el));
    }

    function initStatementDrift() {
      const orb = document.querySelector(".statement-orb") as HTMLElement;
      const sec = document.querySelector(".statement") as HTMLElement;
      if (!orb || !sec) return;
      let ticking = false;

      function apply() {
        ticking = false;
        const r = sec.getBoundingClientRect();
        const span = window.innerHeight + r.height;
        const prog = clamp((window.innerHeight - r.top) / span, 0, 1);
        const t = (prog - 0.5);
        orb.style.transform = `translateY(${(t * 90).toFixed(1)}px) rotate(${(t * 44).toFixed(1)}deg)`;
      }
      function onScroll() {
        if (!ticking) { ticking = true; requestAnimationFrame(apply); }
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", apply);
      apply();
    }

    function initDeck() {
      const deck = document.getElementById("deck");
      if (!deck) return;
      const cards = Array.from(deck.querySelectorAll<HTMLElement>(".deck-card"));
      if (!cards.length) return;
      const dotsWrap = document.getElementById("deckDots");
      const order = cards.map((_, i) => i);

      let dragging = false, startX = 0, startY = 0, pid: number | null = null, current: HTMLElement | null = null, busy = false;
      const THROW_MS = reduced ? 140 : 480;

      const dots: HTMLElement[] = [];
      if (dotsWrap && dotsWrap.children.length === 0) {
        cards.forEach(() => {
          const d = document.createElement("span");
          d.className = "deck-dot";
          dotsWrap.appendChild(d);
          dots.push(d);
        });
      }

      function stackTransform(pos: number) {
        const sign = pos % 2 ? 1 : -1;
        return `translate(${pos * 7}px, ${pos * -5}px) scale(${(1 - pos * 0.035).toFixed(3)}) rotate(${(sign * pos * 0.9).toFixed(2)}deg)`;
      }

      function layout(withTransition: boolean) {
        order.forEach((cardIdx, pos) => {
          const c = cards[cardIdx];
          c.style.transition = withTransition ? "transform .45s cubic-bezier(.22,1,.36,1), opacity .3s" : "none";
          c.style.transform = stackTransform(pos);
          c.style.opacity = pos > 4 ? "0" : "1";
          c.style.zIndex = String(cards.length - pos);
          c.style.pointerEvents = pos === 0 ? "auto" : "none";
          c.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
        });
        dots.forEach((d, i) => { d.classList.toggle("is-on", i === order[0]); });
      }

      function topCard() { return cards[order[0]]; }

      function throwOut(dir: number) {
        if (busy) return;
        busy = true;
        const c = topCard();
        const w = deck?.offsetWidth || 400;
        c.style.transition = `transform ${THROW_MS}ms cubic-bezier(.4,0,.2,1), opacity ${THROW_MS}ms`;
        c.style.transform = `translate(${dir * w * 1.25}px, -52px) rotate(${dir * 20}deg) scale(1.03)`;
        c.style.opacity = "0";
        window.setTimeout(() => {
          order.push(order.shift()!);
          layout(false);
          requestAnimationFrame(() => { requestAnimationFrame(() => { layout(true); busy = false; }); });
        }, THROW_MS - 10);
      }

      const onPointerDown = (e: PointerEvent) => {
        if (busy || (e.target as HTMLElement).closest("a")) return;
        dragging = true;
        current = topCard();
        pid = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        current.style.transition = "none";
        try { deck.setPointerCapture(pid); } catch (_) {}
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!dragging || e.pointerId !== pid || !current) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        current.style.transform = `translate(${dx}px, ${dy * 0.4}px) rotate(${(dx * 0.05).toFixed(2)}deg) scale(1.02)`;
      };

      const endDrag = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        if (pid !== null) { try { deck.releasePointerCapture(pid); } catch (_) {} }
        const dx = (e.clientX || startX) - startX;
        const w = deck?.offsetWidth || 400;
        if (Math.abs(dx) > w * 0.1 && current) {
          throwOut(dx < 0 ? -1 : 1);
        } else if (current) {
          current.style.transition = "transform .3s cubic-bezier(.22,1,.36,1)";
          current.style.transform = stackTransform(0);
        }
        current = null;
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") { e.preventDefault(); throwOut(1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); throwOut(-1); }
      };

      deck.addEventListener("pointerdown", onPointerDown as any);
      deck.addEventListener("pointermove", onPointerMove as any);
      deck.addEventListener("pointerup", endDrag as any);
      deck.addEventListener("pointercancel", endDrag as any);
      deck.addEventListener("keydown", onKeyDown as any);

      layout(true);
    }
  }, []);

  return (
    <>
      <a className="skip-link" href="#work">Skip to content</a>

      <nav className="nav" aria-label="Primary">
        <a className="nav__mark" href="#top">Safwan&nbsp;Ali<span>.</span></a>
        <div className="nav__links">
          <a href="#work">Work</a>
          <a href="#practice">Practice</a>
          <a href="#timeline">Timeline</a>
          <a href="#contact">Contact</a>
        </div>
        <a className="nav__cta" href="assets/SafwanAli_Resume.pdf" target="_blank" rel="noopener">CV ↗</a>
      </nav>

      {/* ============ THREEUI KAGE SCENE HERO ============ */}
      <section id="top" style={{ width: "100%", height: "100vh", position: "relative" }}>
        <Scene />
      </section>

      <main>
        {/* ============ STATEMENT ============ */}
        <section className="statement reveal" id="statement">
          <span className="statement-index" aria-hidden="true">01</span>
          <span className="statement-orb" aria-hidden="true"></span>
          <div className="statement-inner">
            <p className="label"><b>01</b> — Statement</p>
            <p className="statement-text">
              I build production AI systems — LLM applications, RAG pipelines, agents,
              real-time voice — and I research how to make their reasoning{" "}
              <span className="amber">trustworthy</span>, especially in medical imaging.
            </p>
          </div>
        </section>

        {/* ============ RELEASES / SELECTED WORK ============ */}
        <section className="releases reveal" id="work">
          <p className="label"><b>02</b> — Selected Work</p>
          <div className="releases-grid">
            <div className="releases-lead">
              <h2>A working catalogue.</h2>
              <p className="lede">
                Shipped products, research code, and coursework — from a medical
                vision-language paper to an outbound voice-agent platform. Flip through
                the deck, or open any repository directly.
              </p>
              <div className="btn-row">
                <a className="btn" href="https://github.com/Safwan2003?tab=repositories" target="_blank" rel="noopener">All 30 Repositories ↗</a>
                <a className="btn" href="https://github.com/Safwan2003" target="_blank" rel="noopener">GitHub Profile ↗</a>
              </div>
            </div>

            <div className="releases-deck">
              <div className="deck" id="deck" tabIndex={0} role="group" aria-label="Project catalogue — drag a card or use left and right arrow keys to flip">
                <article className="deck-card">
                  <div className="deck-card__top"><span>CAT-01</span><span>Research</span></div>
                  <h3>Med-GReF</h3>
                  <p>Evidence-guided multimodal fusion and an NLI hallucination verifier for medical vision-language reasoning. Accuracy 0.82 → 0.91, undetected contradictions cut 2.4×. Workshop paper, under submission.</p>
                  <div className="deck-card__foot">
                    <span className="stack">PyTorch · BiomedCLIP · NLI verifier · radiomics</span>
                    <span className="deck-card__links">
                      <a href="https://github.com/Safwan2003/Med-Gref" target="_blank" rel="noopener">Code ↗</a>
                      <a href="assets/Med-GReF_Paper.pdf" target="_blank" rel="noopener">Paper ↗</a>
                    </span>
                  </div>
                </article>

                <article className="deck-card">
                  <div className="deck-card__top"><span>CAT-02</span><span>Voice AI</span></div>
                  <h3>Voxreach</h3>
                  <p>Outbound SDR voice-agent platform: STT → LLM → TTS over LiveKit real-time transport, taken from a Colab GPU prototype to a containerized self-hosted production deployment.</p>
                  <div className="deck-card__foot">
                    <span className="stack">Python · LiveKit · STT/TTS · LLM</span>
                    <span className="deck-card__links"><a href="https://github.com/Safwan2003/voice" target="_blank" rel="noopener">Code ↗</a></span>
                  </div>
                </article>

                <article className="deck-card">
                  <div className="deck-card__top"><span>CAT-03</span><span>Agents</span></div>
                  <h3>AI Leads Scraper</h3>
                  <p>Multi-agent FastAPI server that writes platform-specific search queries, scrapes and enriches leads with Crawl4AI, and scores them via LLM on buying signals and red flags.</p>
                  <div className="deck-card__foot">
                    <span className="stack">Python · FastAPI · Crawl4AI · MySQL · litellm</span>
                    <span className="deck-card__links"><a href="https://github.com/Safwan2003/ai_leads_scraper_final_server" target="_blank" rel="noopener">Code ↗</a></span>
                  </div>
                </article>

                <article className="deck-card">
                  <div className="deck-card__top"><span>CAT-04</span><span>Generative</span></div>
                  <h3>Vidra</h3>
                  <p>Agentic pipeline where collaborating AI agents write, illustrate, animate, and narrate a story to generate studio-quality marketing video from a single text prompt.</p>
                  <div className="deck-card__foot">
                    <span className="stack">Python · Multi-agent · Generative media</span>
                    <span className="deck-card__links"><a href="https://github.com/Safwan2003/Vidra-Your-AI-Video-Director" target="_blank" rel="noopener">Code ↗</a></span>
                  </div>
                </article>

                <article className="deck-card">
                  <div className="deck-card__top"><span>CAT-05</span><span>Thesis</span></div>
                  <h3>Lunar Soil Analysis</h3>
                  <p>Final-year project aligned with SUPARCO's ICUBE-Qamar mission: 457 Chang'e 3 rover images → six mineral oxides, calibrated to APXS ground truth. SAM 2.1 + ResNet-18 + Gemini 2.0 Flash.</p>
                  <div className="deck-card__foot">
                    <span className="stack">Python · SAM 2.1 · ResNet-18 · Streamlit</span>
                    <span className="deck-card__links"><a href="https://github.com/Safwan2003/AI-Driven-Lunar-Soil-Composition-Analysis-Using-Imagery-and-Large-Language-Models" target="_blank" rel="noopener">Code ↗</a></span>
                  </div>
                </article>

                <article className="deck-card">
                  <div className="deck-card__top"><span>CAT-06</span><span>Streaming</span></div>
                  <h3>Summariz</h3>
                  <p>Live video-streaming web app pairing real-time speech-to-text transcription with AI-powered summarization.</p>
                  <div className="deck-card__foot">
                    <span className="stack">Python · STT · LLM</span>
                    <span className="deck-card__links"><a href="https://github.com/Safwan2003/Summariz-Live-Streaming-with-Real-Time-Transcription-Summarization-Built-by-AFS-Solutions" target="_blank" rel="noopener">Code ↗</a></span>
                  </div>
                </article>

                <article className="deck-card">
                  <div className="deck-card__top"><span>CAT-07</span><span>ML</span></div>
                  <h3>Heart Disease Prediction</h3>
                  <p>Deployed clinical risk classifier on Streamlit Cloud with feature selection, preprocessing, and hyperparameter tuning; real-time inference.</p>
                  <div className="deck-card__foot">
                    <span className="stack">Python · Scikit-learn · Streamlit</span>
                    <span className="deck-card__links"><a href="https://github.com/Safwan2003/RandomForest_Heart_Disease_Prediction" target="_blank" rel="noopener">Code ↗</a></span>
                  </div>
                </article>
              </div>
              <p className="deck-hint">Drag a card — or use ← → keys</p>
              <div className="deck-dots" id="deckDots" aria-hidden="true"></div>
            </div>
          </div>
        </section>

        {/* ============ ROSTER / PRACTICE ============ */}
        <section className="practice reveal" id="practice">
          <p className="label"><b>03</b> — Practice</p>
          <div className="roster">
            <div className="roster-row">
              <span className="roster-tag">Language Models</span>
              <span className="roster-name">LLM Apps &amp; RAG Pipelines</span>
              <span className="roster-count">12</span>
            </div>
            <div className="roster-row">
              <span className="roster-tag">Agents</span>
              <span className="roster-name">Multi-Agent &amp; Agentic Workflows</span>
              <span className="roster-count">05</span>
            </div>
            <div className="roster-row">
              <span className="roster-tag">Voice</span>
              <span className="roster-name">Real-Time Voice AI · STT / TTS</span>
              <span className="roster-count">03</span>
            </div>
            <div className="roster-row">
              <span className="roster-tag">Vision</span>
              <span className="roster-name">Computer Vision &amp; Medical Imaging</span>
              <span className="roster-count">06</span>
            </div>
            <div className="roster-row">
              <span className="roster-tag">Research</span>
              <span className="roster-name">Papers &amp; Preprints</span>
              <span className="roster-count">02</span>
            </div>
            <div className="roster-row">
              <span className="roster-tag">Full-Stack</span>
              <span className="roster-name">AI Web Apps &amp; Inference APIs</span>
              <span className="roster-count">04</span>
            </div>
          </div>
        </section>

        {/* ============ DATES / TIMELINE ============ */}
        <section className="timeline reveal" id="timeline">
          <p className="label"><b>04</b> — Timeline</p>
          <table className="dates">
            <thead>
              <tr><th scope="col">Milestone</th><th scope="col">Year</th><th scope="col">Track</th><th scope="col">Detail</th></tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="Milestone">Med-GReF</td>
                <td data-label="Year">2026</td>
                <td data-label="Track">Research</td>
                <td data-label="Detail">Evidence-guided medical VLM; workshop paper, under submission</td>
              </tr>
              <tr>
                <td data-label="Milestone">AI Engineer</td>
                <td data-label="Year">2025 —</td>
                <td data-label="Track">Role</td>
                <td data-label="Detail">Promoted from AI intern; production LLM &amp; voice systems</td>
              </tr>
              <tr>
                <td data-label="Milestone">Voxreach</td>
                <td data-label="Year">2026</td>
                <td data-label="Track">Project</td>
                <td data-label="Detail">Outbound voice-agent platform, prototype to production</td>
              </tr>
              <tr>
                <td data-label="Milestone">Lunar Soil Composition Analysis</td>
                <td data-label="Year">2025</td>
                <td data-label="Track">Thesis</td>
                <td data-label="Detail">SUPARCO ICUBE-Qamar–aligned final-year project</td>
              </tr>
              <tr>
                <td data-label="Milestone">AI Internship</td>
                <td data-label="Year">2025</td>
                <td data-label="Track">Role</td>
                <td data-label="Detail">Three-month AI program; converted to an engineering role</td>
              </tr>
              <tr>
                <td data-label="Milestone">BS Computer Science</td>
                <td data-label="Year">2022 – 26</td>
                <td data-label="Track">Degree</td>
                <td data-label="Detail">Salim Habib University — Data Science, ML &amp; AI</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ============ CLOSE ============ */}
        <section className="close reveal" id="contact">
          <p className="label"><b>05</b> — Contact</p>
          <h2>Let's build something grounded.</h2>
          <p className="close-fine">
            Open to funded Master's positions and research-assistant roles in AI —
            large language models, retrieval, multimodal reasoning, and trustworthy
            generation. Email is the surest way to reach me.
          </p>
          <div className="close-actions">
            <a className="btn" href="mailto:safwanalimukaddam@gmail.com">Email ↗</a>
            <a className="btn" href="https://linkedin.com/in/safwan-ali-281aa1275" target="_blank" rel="noopener">LinkedIn ↗</a>
            <a className="btn" href="https://github.com/Safwan2003" target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </section>
      </main>

      <div className="footer-strip">
        <span>© <span id="year">2026</span> Safwan Ali</span>
        <span>Karachi, PK</span>
        <span><a href="https://github.com/Safwan2003/Safwan_Ali" target="_blank" rel="noopener">Source</a></span>
      </div>
      <div className="endmark" aria-hidden="true">
        <div className="endmark__row">Safwan Ali<span>.</span></div>
      </div>
    </>
  );
}

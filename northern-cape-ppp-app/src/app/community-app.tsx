"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

export type ProjectRow = {
  id: number;
  slug: string;
  title: string;
  category: string;
  location: string;
  stage: string;
  timeline: string;
  investment: string;
  jobs: number;
  summary: string;
  description: string;
  requirements: string;
  opportunityType: string;
  contactName: string;
  contactEmail: string;
  verified: boolean;
  featured: boolean;
};

export type BusinessRow = {
  id: number;
  name: string;
  category: string;
  location: string;
  entityType: string;
  services: string;
  description: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  cipcVerified: boolean;
  taxVerified: boolean;
  bbbeeLevel: string;
};

export type OpportunityRow = {
  id: number;
  kind: string;
  title: string;
  employer: string;
  location: string;
  commitment: string;
  reward: string;
  closingDate: string;
  summary: string;
  requirements: string;
  verified: boolean;
};

type TabKey = "projekte" | "besighede" | "werk";
type SubmissionState = "idle" | "sending" | "success" | "error";

type FormConfig = {
  type: "belegging" | "besigheid" | "aansoek";
  title: string;
  intro: string;
  eyebrow: string;
  referenceLabel: string;
  projectId?: number;
  opportunityId?: number;
  categoryDefault?: string;
  submitLabel: string;
};

type IconName =
  | "arrow-right"
  | "arrow-up-right"
  | "bolt"
  | "briefcase"
  | "check"
  | "close"
  | "clock"
  | "factory"
  | "graduation"
  | "leaf"
  | "mail"
  | "menu"
  | "people"
  | "pin"
  | "search"
  | "shield"
  | "spark"
  | "store"
  | "waves";

const iconPaths: Record<IconName, ReactNode> = {
  "arrow-right": <path d="M5 12h14m-6-6 6 6-6 6" />,
  "arrow-up-right": <path d="M7 17 17 7M7 7h10v10" />,
  bolt: <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" />
    </>
  ),
  close: <path d="m18 6-12 12M6 6l12 12" />,
  factory: (
    <>
      <path d="M3 21V9l6 4V9l6 4V5h6v16H3Z" />
      <path d="M15 9h2m-2 4h2m-9 4h2m4 0h2" />
    </>
  ),
  graduation: (
    <>
      <path d="m12 4 10 5-10 5L2 9l10-5Z" />
      <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4c-7 0-13 2-15 7a6 6 0 0 0 8 8c5-2 7-8 7-15Z" />
      <path d="M4 20c3-5 7-8 12-11" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.5 20c0-3.6 2.9-5.6 6.5-5.6s6.5 2 6.5 5.6M17 5.2a3.4 3.4 0 0 1 0 6.4m1.6 2.9c2 .7 3.4 2.3 3.4 4.6" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.3 2.9 7.8 7 9 4.1-1.2 7-4.7 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
      <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
    </>
  ),
  store: (
    <>
      <path d="M4 10v10h16V10M3 4h18l1 5a3 3 0 0 1-5 2 3 3 0 0 1-5 0 3 3 0 0 1-5 0 3 3 0 0 1-5-2l1-5Z" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  waves: <path d="M2 7c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 13c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 19c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0" />,
};

function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  );
}

const tabs: { key: TabKey; label: string; caption: string; icon: IconName }[] = [
  { key: "projekte", label: "Projekte & beleggings", caption: "Geleenthede vir kontrakteurs, verskaffers en beleggers", icon: "factory" },
  { key: "besighede", label: "Besigheidsregister", caption: "Plaaslike ondernemings, koöperasies en diensverskaffers", icon: "store" },
  { key: "werk", label: "Werk & vaardighede", caption: "Vakatures, kontrakte, opleiding en vakleerlingskappe", icon: "graduation" },
];

function projectIcon(category: string): IconName {
  const value = category.toLowerCase();
  if (value.includes("energie")) return "bolt";
  if (value.includes("hawe") || value.includes("see")) return "waves";
  if (value.includes("gemeenskap")) return "people";
  if (value.includes("landbou") || value.includes("see-aak")) return "leaf";
  return "factory";
}

function businessIcon(category: string): IconName {
  const value = category.toLowerCase();
  if (value.includes("konstruksie")) return "factory";
  if (value.includes("vervoer")) return "briefcase";
  if (value.includes("voedsel")) return "leaf";
  if (value.includes("veiligheid")) return "shield";
  if (value.includes("tegnologie")) return "bolt";
  return "store";
}

function kindLabel(kind: string) {
  if (kind === "opleiding") return "Opleiding";
  if (kind === "kontrak") return "Korttermynkontrak";
  return "Vakature";
}

export function CommunityApp({
  projects,
  businesses,
  opportunities,
}: {
  projects: ProjectRow[];
  businesses: BusinessRow[];
  opportunities: OpportunityRow[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("projekte");
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("Alles");
  const [businessFilter, setBusinessFilter] = useState("Alles");
  const [workFilter, setWorkFilter] = useState("Alles");
  const [activeProject, setActiveProject] = useState<ProjectRow | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [state, setState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const numberFormat = useMemo(() => new Intl.NumberFormat("af-ZA"), []);

  const projectCategories = useMemo(
    () => ["Alles", ...Array.from(new Set(projects.map((item) => item.category)))],
    [projects],
  );
  const businessCategories = useMemo(
    () => ["Alles", ...Array.from(new Set(businesses.map((item) => item.category)))],
    [businesses],
  );
  const workKinds = useMemo(
    () => ["Alles", ...Array.from(new Set(opportunities.map((item) => item.kind)))],
    [opportunities],
  );

  const query = search.trim().toLowerCase();

  const visibleProjects = useMemo(
    () =>
      projects.filter((item) => {
        const matchCategory = projectFilter === "Alles" || item.category === projectFilter;
        const haystack = `${item.title} ${item.category} ${item.location} ${item.summary} ${item.opportunityType}`.toLowerCase();
        return matchCategory && (!query || haystack.includes(query));
      }),
    [projectFilter, projects, query],
  );

  const visibleBusinesses = useMemo(
    () =>
      businesses.filter((item) => {
        const matchCategory = businessFilter === "Alles" || item.category === businessFilter;
        const haystack = `${item.name} ${item.category} ${item.location} ${item.services} ${item.entityType}`.toLowerCase();
        return matchCategory && (!query || haystack.includes(query));
      }),
    [businessFilter, businesses, query],
  );

  const visibleWork = useMemo(
    () =>
      opportunities.filter((item) => {
        const matchKind = workFilter === "Alles" || item.kind === workFilter;
        const haystack = `${item.title} ${item.employer} ${item.location} ${item.summary}`.toLowerCase();
        return matchKind && (!query || haystack.includes(query));
      }),
    [opportunities, query, workFilter],
  );

  const totalJobs = projects.reduce((total, item) => total + item.jobs, 0);

  useEffect(() => {
    if (!activeProject && !formConfig) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveProject(null);
        setFormConfig(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeProject, formConfig]);

  function openForm(config: FormConfig) {
    setActiveProject(null);
    setState("idle");
    setErrorMessage("");
    setFormConfig(config);
  }

  function goToTab(tab: TabKey) {
    setActiveTab(tab);
    setMenuOpen(false);
    setSearch("");
    document.getElementById("modules")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formConfig) return;
    setState("sending");
    setErrorMessage("");

    const data = new FormData(event.currentTarget);
    const body = {
      type: formConfig.type,
      referenceLabel: formConfig.referenceLabel,
      projectId: formConfig.projectId ?? null,
      opportunityId: formConfig.opportunityId ?? null,
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      organisation: String(data.get("organisation") ?? ""),
      category: String(data.get("category") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Die indiening het misluk. Probeer weer.");
      setState("success");
    } catch (error) {
      setState("error");
      setErrorMessage(error instanceof Error ? error.message : "Daar was ’n probleem. Probeer weer.");
    }
  }

  const searchPlaceholder =
    activeTab === "projekte"
      ? "Soek projekte, sektore of plekke"
      : activeTab === "besighede"
        ? "Soek verskaffers, dienste of kategorieë"
        : "Soek vakatures, kontrakte of opleiding";

  return (
    <>
      <header className="site-header">
        <div className="header-inner page-shell">
          <a className="brand" href="#top" aria-label="Boegoe Baai Gemeenskapsapp — terug na bo">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="14.5" />
                <path d="M5.5 23c3.4-2.6 6.1-2.6 9.5 0s6.1 2.6 9.5 0 6.1-2.6 9.5 0" />
                <path d="M20 5.5v9M14 11l6-5.5L26 11" />
              </svg>
            </span>
            <span className="brand-copy">
              <span className="brand-name">BOEGOE<span>BAAI</span></span>
              <span className="brand-caption">GEMEENSKAPSAPP · NOORD-KAAP</span>
            </span>
          </a>

          <nav className={`main-nav ${menuOpen ? "main-nav-open" : ""}`} aria-label="Hoofnavigasie">
            {tabs.map((tab) => (
              <button key={tab.key} type="button" onClick={() => goToTab(tab.key)}>
                {tab.label}
              </button>
            ))}
            <button type="button" onClick={() => { setMenuOpen(false); document.getElementById("hoe-werk-dit")?.scrollIntoView({ behavior: "smooth" }); }}>
              Hoe dit werk
            </button>
          </nav>

          <button
            className="button button-header"
            onClick={() =>
              openForm({
                type: "besigheid",
                title: "Registreer jou onderneming",
                intro: "Voeg jou onderneming, koöperasie of diens by die plaaslike register sodat hoofkontrakteurs jou kan vind.",
                eyebrow: "BESIGHEIDSREGISTER",
                referenceLabel: "Nuwe besigheidsregistrasie",
                submitLabel: "Dien registrasie in",
              })
            }
          >
            Registreer <Icon name="arrow-up-right" size={15} />
          </button>
          <button
            className="mobile-menu-button"
            type="button"
            aria-label={menuOpen ? "Maak kieslys toe" : "Maak kieslys oop"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? "close" : "menu"} size={22} />
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section" id="top">
          <div className="hero-image-wrap">
            <Image
              src="/images/boegoe-baai.jpg"
              alt="Die kuslyn naby Boegoe Baai in die Noord-Kaap"
              fill
              priority
              sizes="100vw"
              className="hero-image"
            />
          </div>
          <div className="hero-shade" />
          <div className="hero-inner page-shell">
            <div className="hero-copy">
              <div className="eyebrow eyebrow-light"><span className="live-dot" /> INKLUSIEWE NYWERHEIDSONTWIKKELING</div>
              <h1>Een plek waar die <em>gemeenskap</em> en geleenthede ontmoet.</h1>
              <p className="hero-description">
                Die Boegoe Baai Gemeenskapsapp verbind inwoners, plaaslike besighede, werksoekers,
                ontwikkelaars en die openbare sektor — met geverifieerde projekte, kontrakte,
                vakatures en opleiding op een platform.
              </p>
              <div className="hero-actions">
                <button className="button button-lime" type="button" onClick={() => goToTab("projekte")}>
                  Verken geleenthede <Icon name="arrow-up-right" size={17} />
                </button>
                <button className="text-link text-link-light" type="button" onClick={() => goToTab("werk")}>
                  Soek werk en opleiding <Icon name="arrow-right" size={17} />
                </button>
              </div>
              <div className="hero-note">
                <span className="hero-note-icon"><Icon name="shield" size={17} /></span>
                <span>Geleenthede word geverifieer om bedrog en vals aanbiedinge te beperk.</span>
              </div>
            </div>

            <div className="hero-photo-label">
              <span className="photo-label-top"><span /> BOEGOE BAAI · NOORD-KAAP</span>
              <span className="photo-label-title">Plaaslike mense.<br />Plaaslike waarde.</span>
              <span className="photo-label-bottom">Gebou vir die gemeenskap <span>↗</span></span>
            </div>
          </div>
        </section>

        <section className="proof-strip" aria-label="Oorsig van die platform">
          <div className="proof-inner page-shell">
            <div className="proof-intro">
              <span className="eyebrow">OP DIE PLATFORM</span>
              <span>Deursigtige geleenthede, naby die huis.</span>
            </div>
            <div className="proof-stat"><strong>{String(projects.length).padStart(2, "0")}</strong><span>projekte en beleggings</span></div>
            <div className="proof-stat"><strong>{String(businesses.length).padStart(2, "0")}</strong><span>geregistreerde ondernemings</span></div>
            <div className="proof-stat"><strong>{numberFormat.format(totalJobs)}<i>+</i></strong><span>indikatiewe moontlike poste</span></div>
          </div>
          <div className="proof-disclaimer page-shell">
            Illustratiewe demonstrasiedata. Bedrae, poste en tydlyne is ramings en nie formele aanbiedinge nie.
          </div>
        </section>

        <section className="modules-section section-padding" id="modules">
          <div className="page-shell">
            <div className="section-kicker"><span>01</span> / KERNFUNKSIES</div>
            <div className="section-heading-row">
              <div className="section-heading-copy">
                <h2>Een app. <em>Drie modules.</em></h2>
                <p>Wissel tussen projekte en beleggings, die plaaslike besigheidsregister, en werk en vaardighede.</p>
              </div>
            </div>

            <div className="tab-bar" role="tablist" aria-label="Kies ’n module">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  type="button"
                  id={`tab-${tab.key}`}
                  aria-selected={activeTab === tab.key}
                  aria-controls={`paneel-${tab.key}`}
                  className={`tab-button ${activeTab === tab.key ? "tab-button-active" : ""}`}
                  onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                >
                  <span className="tab-icon"><Icon name={tab.icon} size={18} /></span>
                  <span className="tab-text">
                    <strong>{tab.label}</strong>
                    <span>{tab.caption}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="module-tools">
              <label className="search-box">
                <Icon name="search" size={18} />
                <span className="visually-hidden">Soek op die platform</span>
                <input
                  type="search"
                  value={search}
                  placeholder={searchPlaceholder}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button className="search-clear" type="button" aria-label="Vee soektog uit" onClick={() => setSearch("")}>
                    <Icon name="close" size={15} />
                  </button>
                )}
              </label>

              <div className="filter-group" role="group" aria-label="Filtreer resultate">
                {activeTab === "projekte" &&
                  projectCategories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={projectFilter === item}
                      className={`filter-chip ${projectFilter === item ? "filter-chip-active" : ""}`}
                      onClick={() => setProjectFilter(item)}
                    >
                      {item}
                    </button>
                  ))}
                {activeTab === "besighede" &&
                  businessCategories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={businessFilter === item}
                      className={`filter-chip ${businessFilter === item ? "filter-chip-active" : ""}`}
                      onClick={() => setBusinessFilter(item)}
                    >
                      {item}
                    </button>
                  ))}
                {activeTab === "werk" &&
                  workKinds.map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={workFilter === item}
                      className={`filter-chip ${workFilter === item ? "filter-chip-active" : ""}`}
                      onClick={() => setWorkFilter(item)}
                    >
                      {item === "Alles" ? "Alles" : kindLabel(item)}
                    </button>
                  ))}
              </div>
            </div>

            {activeTab === "projekte" && (
              <div role="tabpanel" id="paneel-projekte" aria-labelledby="tab-projekte">
                {visibleProjects.length > 0 ? (
                  <div className="project-grid">
                    {visibleProjects.map((project, index) => (
                      <article key={project.id} className={`project-card ${project.featured ? "project-card-featured" : ""}`}>
                        <div className={`project-art ${project.featured ? "project-art-featured" : ""}`}>
                          {project.featured && (
                            <Image src="/images/boegoe-baai.jpg" alt="" fill sizes="(max-width: 760px) 100vw, 50vw" className="project-art-image" />
                          )}
                          <div className="project-art-shade" />
                          <div className="project-art-topline">
                            <span className="project-location"><Icon name="pin" size={14} /> {project.location}</span>
                            <span className="project-art-index">0{index + 1}</span>
                          </div>
                          <div className="project-art-center">
                            <span className="project-icon"><Icon name={projectIcon(project.category)} size={27} /></span>
                            <span className="project-art-sector">{project.category}</span>
                          </div>
                          {project.verified && (
                            <span className="verified-badge"><Icon name="shield" size={12} /> GEVERIFIEER</span>
                          )}
                        </div>

                        <div className="project-card-body">
                          <div className="project-card-meta">
                            <span>{project.opportunityType}</span>
                            <span className="project-stage"><i /> {project.stage}</span>
                          </div>
                          <h3>{project.title}</h3>
                          <p>{project.summary}</p>
                          <div className="project-metrics">
                            <div><span>INDIKATIEWE BELEGGING</span><strong>{project.investment}</strong></div>
                            <div><span>MOONTLIKE POSTE</span><strong>{numberFormat.format(project.jobs)}<i>+</i></strong></div>
                            <div><span>TYDLYN</span><strong className="metric-small">{project.timeline}</strong></div>
                          </div>
                          <button className="project-details-link" type="button" onClick={() => setActiveProject(project)}>
                            Bekyk besonderhede <Icon name="arrow-up-right" size={17} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState onReset={() => { setSearch(""); setProjectFilter("Alles"); }} />
                )}
              </div>
            )}

            {activeTab === "besighede" && (
              <div role="tabpanel" id="paneel-besighede" aria-labelledby="tab-besighede">
                {visibleBusinesses.length > 0 ? (
                  <div className="business-grid">
                    {visibleBusinesses.map((business) => (
                      <article key={business.id} className="business-card">
                        <div className="business-head">
                          <span className="business-icon"><Icon name={businessIcon(business.category)} size={20} /></span>
                          <div>
                            <h3>{business.name}</h3>
                            <span className="business-meta">{business.category} · {business.entityType}</span>
                          </div>
                        </div>
                        <p className="business-description">{business.description}</p>
                        <div className="business-services"><span>DIENSTE</span><p>{business.services}</p></div>
                        <div className="credential-row">
                          {business.cipcVerified && <span className="credential"><Icon name="check" size={11} /> CIPC-registrasie</span>}
                          {business.taxVerified && <span className="credential"><Icon name="check" size={11} /> Belastingstatus</span>}
                          {business.bbbeeLevel && <span className="credential"><Icon name="check" size={11} /> {business.bbbeeLevel}</span>}
                        </div>
                        <div className="business-footer">
                          <span className="project-location business-location"><Icon name="pin" size={13} /> {business.location}</span>
                          <a className="business-contact" href={`mailto:${business.contactEmail}`}>
                            <Icon name="mail" size={14} /> Kontak {business.contactPerson.split(" ")[0]}
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState onReset={() => { setSearch(""); setBusinessFilter("Alles"); }} />
                )}

                <div className="register-callout">
                  <div>
                    <h3>Is jou onderneming nog nie gelys nie?</h3>
                    <p>Registreer jou besigheid of koöperasie sodat hoofkontrakteurs jou as plaaslike verskaffer kan vind.</p>
                  </div>
                  <button
                    className="button button-dark"
                    type="button"
                    onClick={() =>
                      openForm({
                        type: "besigheid",
                        title: "Registreer jou onderneming",
                        intro: "Deel jou besonderhede en dienste. Ons span bevestig dokumentasie voordat die profiel gepubliseer word.",
                        eyebrow: "BESIGHEIDSREGISTER",
                        referenceLabel: "Nuwe besigheidsregistrasie",
                        submitLabel: "Dien registrasie in",
                      })
                    }
                  >
                    Registreer besigheid <Icon name="arrow-up-right" size={16} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "werk" && (
              <div role="tabpanel" id="paneel-werk" aria-labelledby="tab-werk">
                {visibleWork.length > 0 ? (
                  <div className="work-list">
                    {visibleWork.map((item) => (
                      <article key={item.id} className="work-card">
                        <span className={`work-kind work-kind-${item.kind}`}>
                          <Icon name={item.kind === "opleiding" ? "graduation" : item.kind === "kontrak" ? "briefcase" : "people"} size={15} />
                          {kindLabel(item.kind)}
                        </span>
                        <div className="work-main">
                          <h3>{item.title}</h3>
                          <span className="work-employer">{item.employer} · {item.location}</span>
                          <p>{item.summary}</p>
                          <span className="work-requirements"><strong>Vereistes:</strong> {item.requirements}</span>
                        </div>
                        <div className="work-side">
                          <div className="work-fact"><span>VERGOEDING / TOELAE</span><strong>{item.reward}</strong></div>
                          <div className="work-fact"><span>VERBINTENIS</span><strong>{item.commitment}</strong></div>
                          <div className="work-closing"><Icon name="clock" size={13} /> Sluit {item.closingDate}</div>
                          <button
                            className="button button-dark work-apply"
                            type="button"
                            onClick={() =>
                              openForm({
                                type: "aansoek",
                                title: item.kind === "opleiding" ? "Registreer vir hierdie program" : "Doen aansoek",
                                intro: `${item.title} — ${item.employer}. Deel jou besonderhede en vaardighede met die werkgewer of opleidingsverskaffer.`,
                                eyebrow: kindLabel(item.kind).toUpperCase(),
                                referenceLabel: `${kindLabel(item.kind)}: ${item.title}`,
                                opportunityId: item.id,
                                submitLabel: item.kind === "opleiding" ? "Registreer vir opleiding" : "Dien aansoek in",
                              })
                            }
                          >
                            {item.kind === "opleiding" ? "Registreer" : "Doen aansoek"} <Icon name="arrow-up-right" size={15} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState onReset={() => { setSearch(""); setWorkFilter("Alles"); }} />
                )}
              </div>
            )}

            <div className="pipeline-footnote">
              <span>*</span> Geleenthede word nagegaan voordat hulle gepubliseer word. Moet nooit geld betaal vir ’n werksgeleentheid of kontrak nie — rapporteer verdagte lysinskrywings.
            </div>
          </div>
        </section>

        <section className="approach-section section-padding" id="hoe-werk-dit">
          <div className="page-shell approach-layout">
            <div className="approach-copy">
              <div className="section-kicker section-kicker-light"><span>02</span> / HOE DIT WERK</div>
              <h2>Deursigtig.<br /><em>En geverifieer.</em></h2>
              <p>
                Elke projek, kontrak en vakature gaan deur ’n basiese verifikasiestap. Dit beskerm
                inwoners teen bedrog en gee ontwikkelaars vertroue in plaaslike verskaffers.
              </p>
              <button
                className="text-link text-link-lime"
                type="button"
                onClick={() =>
                  openForm({
                    type: "belegging",
                    title: "Word ’n vennoot of belegger",
                    intro: "Vertel ons van jou onderneming, kundigheid of beleggingsbelangstelling in die Boegoe Baai-streek.",
                    eyebrow: "PROJEK- EN BELEGGINGSPORTAAL",
                    referenceLabel: "Algemene beleggingsbelangstelling",
                    submitLabel: "Stuur belangstelling",
                  })
                }
              >
                Begin ’n gesprek <Icon name="arrow-right" size={17} />
              </button>
              <div className="approach-seal"><Icon name="shield" size={18} /><span>GEVERIFIEERDE LYSTE.<br />PLAASLIKE VOORKEUR.</span></div>
            </div>

            <div className="steps-list">
              {[
                { n: "01", icon: "factory" as IconName, h: "Projekte word gepubliseer", p: "Ontwikkelaars en die openbare sektor lys projekte met beskrywings, vereistes, tydlyne en kontakbesonderhede." },
                { n: "02", icon: "shield" as IconName, h: "Verifikasie vind plaas", p: "Lyste en maatskappydokumente soos registrasie, belastingstatus en B-BBEE word nagegaan waar van toepassing." },
                { n: "03", icon: "store" as IconName, h: "Plaaslikes word gekoppel", p: "Hoofkontrakteurs vind verskaffers in die register, en inwoners sien kontrakte, vakatures en opleiding." },
                { n: "04", icon: "spark" as IconName, h: "Waarde bly plaaslik", p: "Werkskepping, vaardighede en ondernemingsgroei word teruggevoer na die gemeenskap." },
              ].map((step) => (
                <article className="step-card" key={step.n}>
                  <span className="step-number">{step.n}</span>
                  <span className="step-icon"><Icon name={step.icon} size={20} /></span>
                  <div><h3>{step.h}</h3><p>{step.p}</p></div>
                </article>
              ))}
              <div className="steps-caption"><span /> VAN GELEENTHEID NA PLAASLIKE IMPAK.</div>
            </div>
          </div>
        </section>

        <section className="closing-section" id="kontak">
          <div className="closing-card page-shell">
            <div className="closing-content">
              <div className="section-kicker"><span>03</span> / SLUIT AAN</div>
              <h2>Bou saam aan<br /><em>Boegoe Baai.</em></h2>
              <p>Of jy nou ’n inwoner, verskaffer, werksoeker of belegger is — registreer en bly op hoogte van nuwe geleenthede.</p>
              <div className="closing-actions">
                <button
                  className="button button-dark"
                  type="button"
                  onClick={() =>
                    openForm({
                      type: "belegging",
                      title: "Word ’n vennoot of belegger",
                      intro: "Deel jou kundigheid, kapasiteit of beleggingsbelangstelling met die projekspan.",
                      eyebrow: "PROJEK- EN BELEGGINGSPORTAAL",
                      referenceLabel: "Algemene beleggingsbelangstelling",
                      submitLabel: "Stuur belangstelling",
                    })
                  }
                >
                  Belê of vennoot word <Icon name="arrow-up-right" size={16} />
                </button>
                <button
                  className="button button-outline-dark"
                  type="button"
                  onClick={() =>
                    openForm({
                      type: "aansoek",
                      title: "Skep ’n vaardigheidsprofiel",
                      intro: "Laat weet ons van jou vaardighede en ervaring. Ons stel jou in kennis van nuwe werk en opleiding wat uit projekte voortspruit.",
                      eyebrow: "WERK & VAARDIGHEDE",
                      referenceLabel: "Vaardigheidsprofiel en kennisgewings",
                      submitLabel: "Skep profiel",
                    })
                  }
                >
                  Skep vaardigheidsprofiel <Icon name="arrow-right" size={16} />
                </button>
              </div>
              <span className="closing-note">Jou inligting word slegs gebruik om op jou indiening te reageer.</span>
            </div>
            <div className="closing-visual" aria-hidden="true">
              <div className="closing-orbit orbit-one" />
              <div className="closing-orbit orbit-two" />
              <div className="closing-sun"><Icon name="waves" size={38} /></div>
              <div className="closing-visual-label">GELEENTHEDE NADER<br /><span>AAN DIE HUIS</span></div>
              <div className="closing-coordinates">BOEGOE BAAI<br />NOORD-KAAP</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner page-shell">
          <a className="brand footer-brand" href="#top" aria-label="Terug na bo">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="14.5" />
                <path d="M5.5 23c3.4-2.6 6.1-2.6 9.5 0s6.1 2.6 9.5 0 6.1-2.6 9.5 0" />
                <path d="M20 5.5v9M14 11l6-5.5L26 11" />
              </svg>
            </span>
            <span className="brand-copy">
              <span className="brand-name">BOEGOE<span>BAAI</span></span>
              <span className="brand-caption">GEMEENSKAPSAPP · NOORD-KAAP</span>
            </span>
          </a>
          <p>’n Platform vir inklusiewe groei.</p>
          <a className="back-to-top" href="#top">TERUG BOONT TOE <span>↑</span></a>
        </div>
        <div className="footer-bottom page-shell">
          <span>© 2026 BOEGOE BAAI GEMEENSKAPSAPP</span>
          <span>ILLUSTRATIEWE KONSEP · NIE ’N FORMELE AANBOD NIE</span>
        </div>
      </footer>

      {activeProject && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveProject(null); }}>
          <section className="project-modal modal-panel" role="dialog" aria-modal="true" aria-labelledby="projek-titel">
            <button className="modal-close" type="button" aria-label="Maak toe" onClick={() => setActiveProject(null)}>
              <Icon name="close" size={19} />
            </button>
            <div className="detail-art">
              <Image src="/images/boegoe-baai.jpg" alt="" fill sizes="(max-width: 760px) 100vw, 720px" />
              <div className="project-art-shade" />
              <span className="project-location"><Icon name="pin" size={14} /> {activeProject.location}</span>
              <span className="detail-art-icon"><Icon name={projectIcon(activeProject.category)} size={32} /></span>
              <span className="detail-art-sector">{activeProject.category} <i>·</i> {activeProject.stage}</span>
            </div>
            <div className="detail-content">
              <div className="detail-eyebrow">
                PROJEKBESONDERHEDE <span>·</span> {activeProject.slug.toUpperCase()}
                {activeProject.verified && <em className="inline-verified"><Icon name="shield" size={11} /> GEVERIFIEER</em>}
              </div>
              <h2 id="projek-titel">{activeProject.title}</h2>
              <p className="detail-summary">{activeProject.summary}</p>
              <p className="detail-description">{activeProject.description}</p>
              <div className="detail-metrics">
                <div><span>INDIKATIEWE BELEGGING</span><strong>{activeProject.investment}</strong></div>
                <div><span>MOONTLIKE POSTE</span><strong>{numberFormat.format(activeProject.jobs)}+</strong></div>
              </div>
              <div className="investment-model"><span>GELEENTHEIDSTIPE</span><p>{activeProject.opportunityType}</p></div>
              <div className="investment-model"><span>VEREISTES</span><p>{activeProject.requirements}</p></div>
              <div className="investment-model"><span>TYDLYN</span><p>{activeProject.timeline}</p></div>
              <div className="investment-model"><span>KONTAK</span><p>{activeProject.contactName} · {activeProject.contactEmail}</p></div>
              <button
                className="button button-dark detail-enquiry"
                type="button"
                onClick={() =>
                  openForm({
                    type: "belegging",
                    title: "Stel belang in hierdie projek",
                    intro: `${activeProject.title} — ${activeProject.opportunityType}. Deel jou kapasiteit, ervaring of beleggingsbelangstelling.`,
                    eyebrow: `PROJEK · ${activeProject.category.toUpperCase()}`,
                    referenceLabel: activeProject.title,
                    projectId: activeProject.id,
                    submitLabel: "Stuur belangstelling",
                  })
                }
              >
                Stel belang in hierdie projek <Icon name="arrow-up-right" size={17} />
              </button>
              <p className="detail-disclaimer">
                Illustratiewe projekinligting. Alle besonderhede is onderhewig aan haalbaarheid, goedkeuring en formele verkrygingsprosesse.
              </p>
            </div>
          </section>
        </div>
      )}

      {formConfig && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormConfig(null); }}>
          <section className="enquiry-modal modal-panel" role="dialog" aria-modal="true" aria-labelledby="vorm-titel">
            <button className="modal-close" type="button" aria-label="Maak toe" onClick={() => setFormConfig(null)}>
              <Icon name="close" size={19} />
            </button>

            {state === "success" ? (
              <div className="form-success" role="status" aria-live="polite">
                <span className="success-mark"><Icon name="check" size={28} /></span>
                <div className="modal-eyebrow">INDIENING ONTVANG</div>
                <h2 id="vorm-titel">Dankie — ons het jou besonderhede.</h2>
                <p>
                  Jou indiening vir <strong>{formConfig.referenceLabel}</strong> is veilig gestoor.
                  {formConfig.type === "besigheid"
                    ? " Ons gaan jou dokumentasie na voordat die profiel in die register verskyn."
                    : " Die betrokke span kan nou met jou opvolg."}
                </p>
                <button className="button button-dark" type="button" onClick={() => setFormConfig(null)}>
                  Klaar <Icon name="check" size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="form-heading">
                  <div className="modal-eyebrow">{formConfig.eyebrow}</div>
                  <h2 id="vorm-titel">{formConfig.title}</h2>
                  <p>{formConfig.intro}</p>
                </div>

                <form className="enquiry-form" onSubmit={handleSubmit}>
                  <div className="honeypot" aria-hidden="true">
                    <label htmlFor="website">Los hierdie veld leeg</label>
                    <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  <div className="form-field-row">
                    <label className="form-field">
                      <span>Volle naam <i>*</i></span>
                      <input name="fullName" type="text" autoComplete="name" placeholder="Voornaam en van" minLength={2} maxLength={180} required />
                    </label>
                    <label className="form-field">
                      <span>E-posadres <i>*</i></span>
                      <input name="email" type="email" autoComplete="email" placeholder="jy@voorbeeld.co.za" maxLength={255} required />
                    </label>
                  </div>

                  <div className="form-field-row">
                    <label className="form-field">
                      <span>Selfoonnommer</span>
                      <input name="phone" type="tel" autoComplete="tel" placeholder="072 000 0000" maxLength={60} />
                    </label>
                    <label className="form-field">
                      <span>
                        {formConfig.type === "aansoek" ? "Huidige werkgewer of opleiding" : "Onderneming of organisasie"}
                        {formConfig.type !== "aansoek" && <i> *</i>}
                      </span>
                      <input
                        name="organisation"
                        type="text"
                        autoComplete="organization"
                        placeholder={formConfig.type === "aansoek" ? "Opsioneel" : "Naam van onderneming"}
                        maxLength={220}
                        required={formConfig.type !== "aansoek"}
                      />
                    </label>
                  </div>

                  <label className="form-field">
                    <span>
                      {formConfig.type === "besigheid" ? "Besigheidskategorie" : formConfig.type === "aansoek" ? "Vaardighede en ervaring" : "Belangstellingsgebied"}
                      {formConfig.type === "besigheid" && <i> *</i>}
                    </span>
                    {formConfig.type === "besigheid" ? (
                      <select name="category" defaultValue="" required>
                        <option value="" disabled>Kies ’n kategorie</option>
                        <option>Konstruksie</option>
                        <option>Vervoer en logistiek</option>
                        <option>Voedsel en voorsiening</option>
                        <option>Veiligheid</option>
                        <option>Tegnologie</option>
                        <option>Instandhouding</option>
                        <option>Ander dienste</option>
                      </select>
                    ) : (
                      <input
                        name="category"
                        type="text"
                        defaultValue={formConfig.categoryDefault ?? ""}
                        placeholder={formConfig.type === "aansoek" ? "Bv. sweiswerk, administrasie, bestuurslisensie" : "Bv. konstruksie, energie, logistiek"}
                        maxLength={160}
                      />
                    )}
                  </label>

                  <label className="form-field">
                    <span>Boodskap <i>*</i></span>
                    <textarea
                      name="message"
                      rows={4}
                      minLength={15}
                      maxLength={2000}
                      placeholder={
                        formConfig.type === "besigheid"
                          ? "Beskryf jou dienste, kapasiteit en beskikbare dokumentasie…"
                          : formConfig.type === "aansoek"
                            ? "Vertel ons van jou ervaring en waarom jy belangstel…"
                            : "Beskryf jou belangstelling, kundigheid of vrae…"
                      }
                      required
                    />
                  </label>

                  {state === "error" && <p className="form-error" role="alert">{errorMessage}</p>}

                  <div className="form-submit-row">
                    <p>Deur in te dien, stem jy in dat jou inligting gebruik word om op hierdie indiening te reageer.</p>
                    <button className="button button-dark form-submit" type="submit" disabled={state === "sending"}>
                      {state === "sending" ? "Besig om te stuur…" : formConfig.submitLabel}
                      {state === "sending" ? <span className="button-spinner" /> : <Icon name="arrow-up-right" size={16} />}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-icon"><Icon name="search" size={22} /></span>
      <h3>Niks gevind nie.</h3>
      <p>Probeer ’n ander soekterm of wys weer alle inskrywings.</p>
      <button className="button button-outline-dark" type="button" onClick={onReset}>
        Wys alles <Icon name="arrow-right" size={16} />
      </button>
    </div>
  );
}

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  SKILL_GAP_COPY,
  SKILL_GAP_FLOATING_PILLS,
  SKILL_GAP_HERO,
} from './skillGapConstants';
import {
  analyzeSkillGap,
  isGeminiConfigured,
  type SkillGapAnalysis,
} from '../services/geminiService';

type PanelId = 'found' | 'opportunities' | 'key' | 'relevant' | 'unusual';

function pickResumeFileFromList(files: FileList | null): File | null {
  if (!files?.length) return null;
  const list = Array.from(files);
  return list.find((f) => /\.(pdf|txt)$/i.test(f.name)) ?? list[0];
}

function CollapsiblePanel({
  id,
  title,
  count,
  badgeClass,
  hint,
  expanded,
  onToggle,
  emptyMessage,
  children,
}: {
  id: PanelId;
  title: string;
  count: number;
  badgeClass: string;
  hint?: string;
  expanded: boolean;
  onToggle: () => void;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  const hasContent = count > 0;
  return (
    <div className="rounded-[var(--cds-border-radius-200)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-white)] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-[var(--cds-color-grey-25)]"
        aria-expanded={expanded}
        aria-controls={`${id}-panel`}
        id={`${id}-heading`}
      >
        <span
          className={`rounded-[var(--cds-border-radius-400)] px-2 py-0.5 cds-body-secondary shrink-0 ${badgeClass}`}
        >
          {count} {title}
        </span>
        <span
          className="material-symbols-rounded ml-auto text-[var(--cds-color-grey-600)] shrink-0"
          style={{ fontSize: 22 }}
          aria-hidden
        >
          {expanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {expanded && (
        <div
          id={`${id}-panel`}
          role="region"
          aria-labelledby={`${id}-heading`}
          className="border-t border-[var(--cds-color-grey-100)] px-4 py-3"
        >
          {hint ? (
            <p className="cds-body-tertiary text-[var(--cds-color-grey-600)] mb-3">{hint}</p>
          ) : null}
          {hasContent ? (
            children
          ) : (
            <p className="cds-body-secondary text-[var(--cds-color-grey-600)]">{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

function SkillList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((s) => (
        <li key={s} className="cds-body-secondary text-[var(--cds-color-grey-975)] pl-1">
          {s}
        </li>
      ))}
    </ul>
  );
}

export const SkillGapTool: React.FC = () => {
  const uploadModalTitleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const [resumeText, setResumeText] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileBusy, setFileBusy] = useState(false);

  const [jobTitle, setJobTitle] = useState('');

  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [fetchBusy, setFetchBusy] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [analyzeBusy, setAnalyzeBusy] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Record<PanelId, boolean>>({
    found: true,
    opportunities: true,
    key: true,
    relevant: true,
    unusual: true,
  });

  const [toolExpanded, setToolExpanded] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);

  const geminiReady = useMemo(() => isGeminiConfigured(), []);

  const toggle = useCallback((id: PanelId) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const processResumeFile = useCallback(async (file: File) => {
    setFileError(null);
    setFileBusy(true);
    try {
      const { extractTextFromResumeFile } = await import('../services/extractResumeText');
      const text = await extractTextFromResumeFile(file);
      setResumeText(text);
      setUploadModalOpen(false);
      setDropActive(false);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Could not read file');
    } finally {
      setFileBusy(false);
    }
  }, []);

  const openUploadModal = useCallback(() => {
    setFileError(null);
    setUploadModalOpen(true);
  }, []);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      await processResumeFile(file);
    },
    [processResumeFile]
  );

  const closeUploadModal = useCallback(() => {
    if (fileBusy) return;
    setUploadModalOpen(false);
    setDropActive(false);
  }, [fileBusy]);

  const onUploadDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDropActive(false);
      const file = pickResumeFileFromList(e.dataTransfer.files);
      if (!file) {
        setFileError(SKILL_GAP_COPY.uploadModalInvalidDrop);
        return;
      }
      if (!/\.(pdf|txt)$/i.test(file.name)) {
        setFileError(SKILL_GAP_COPY.uploadModalInvalidDrop);
        return;
      }
      void processResumeFile(file);
    },
    [processResumeFile]
  );

  const onUploadDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onUploadDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropActive(true);
  }, []);

  const onUploadDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropActive(false);
    }
  }, []);

  const fetchJobPosting = useCallback(async () => {
    const url = jobUrl.trim();
    if (!url) {
      setFetchError('Enter a job posting URL');
      return;
    }
    setFetchError(null);
    setFetchBusy(true);
    try {
      const res = await fetch('/api/fetch-job-posting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { text?: string; titleGuess?: string | null; error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      if (data.text) {
        setJobDescription((prev) => (prev.trim() ? `${prev.trim()}\n\n---\n${data.text}` : data.text));
      }
      if (data.titleGuess && !jobTitle.trim()) {
        setJobTitle(data.titleGuess);
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Could not fetch URL');
    } finally {
      setFetchBusy(false);
    }
  }, [jobUrl, jobTitle]);

  const runAnalyze = useCallback(async () => {
    setAnalyzeError(null);
    const r = resumeText.trim();
    if (r.length < 40) {
      setAnalyzeError('Add more resume text (upload a file or paste below).');
      return;
    }
    const jt = jobTitle.trim();
    const jd = jobDescription.trim();
    if (!jt && jd.length < 40) {
      setAnalyzeError('Paste a job description or fetch a posting from URL.');
      return;
    }
    if (!geminiReady) {
      setAnalyzeError(SKILL_GAP_COPY.geminiOffline);
      return;
    }
    setAnalyzeBusy(true);
    setAnalysis(null);
    try {
      const result = await analyzeSkillGap({
        resumeText: r,
        jobTitle: jt || 'General professional role',
        jobDescriptionText: jd,
      });
      if (!result) {
        setAnalyzeError('Analysis failed. Try again with shorter text or check your API key.');
        return;
      }
      setAnalysis(result);
    } finally {
      setAnalyzeBusy(false);
    }
  }, [resumeText, jobTitle, jobDescription, geminiReady]);

  useEffect(() => {
    if (!toolExpanded) return;
    const t = window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
    return () => window.clearTimeout(t);
  }, [toolExpanded]);

  useEffect(() => {
    if (!toolExpanded) {
      setUploadModalOpen(false);
      setDropActive(false);
    }
  }, [toolExpanded]);

  useEffect(() => {
    if (!uploadModalOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') closeUploadModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [uploadModalOpen, closeUploadModal]);

  const showTitleDisclaimer = jobTitle.trim().length > 0 && jobDescription.trim().length < 80;
  /** Match runAnalyze minimum so these panels only appear once resume is ready to analyze. */
  const showResumeDetailPanels = resumeText.trim().length >= 40;

  return (
    <section
      ref={sectionRef}
      className={`bg-[var(--cds-color-white)] border border-[var(--cds-color-grey-100)] rounded-[var(--cds-border-radius-200)] overflow-hidden hover:shadow-[var(--cds-elevation-level2)] transition-shadow p-4 sm:p-5 lg:p-6 ${
        !toolExpanded ? 'lg:flex lg:h-[300px] lg:min-h-0 lg:flex-col' : ''
      }`}
      aria-labelledby="skill-gap-main-heading"
    >
      {!toolExpanded ? (
        <div className="grid min-h-0 grid-cols-1 gap-6 lg:flex-1 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
          <div className="flex min-h-0 flex-col justify-center gap-3 lg:py-0">
            <h2
              id="skill-gap-main-heading"
              className="cds-subtitle-lg text-[var(--cds-color-grey-975)] sm:text-[1.375rem] sm:leading-tight sm:font-semibold"
            >
              {SKILL_GAP_COPY.sectionTitle}
            </h2>
            <p className="cds-body-secondary whitespace-pre-line text-[var(--cds-color-grey-600)] leading-relaxed max-w-3xl lg:line-clamp-3">
              {SKILL_GAP_COPY.intro}
            </p>
            <button
              type="button"
              aria-expanded={false}
              aria-label={SKILL_GAP_COPY.entryCtaAriaLabel}
              onClick={() => setToolExpanded(true)}
              className="inline-flex h-9 w-[140px] shrink-0 items-center justify-center rounded-lg bg-[var(--cds-color-grey-975)] px-2 font-semibold text-[var(--cds-color-white)] transition-colors hover:bg-[var(--cds-color-grey-900)] cds-action-secondary text-center text-sm leading-tight"
            >
              {SKILL_GAP_COPY.entryCta}
            </button>
          </div>
          <div className="relative mx-auto h-[220px] w-full max-w-xl shrink-0 lg:mx-0 lg:h-full lg:max-w-none lg:min-h-0">
            <div className="relative h-full min-h-0 overflow-hidden rounded-[var(--cds-border-radius-200)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-grey-25)] shadow-[var(--cds-elevation-level1)]">
              <img
                src={SKILL_GAP_HERO.imageSrc}
                alt={SKILL_GAP_HERO.imageAlt}
                className="absolute inset-0 h-full w-full object-cover grayscale"
              />
              {SKILL_GAP_FLOATING_PILLS.map((pill) => (
                <span
                  key={pill.label}
                  className={`pointer-events-none absolute max-w-[min(42%,11rem)] rounded-full px-2.5 py-1 text-center text-xs font-semibold shadow-[var(--cds-elevation-level1)] sm:text-sm ${
                    pill.tone === 'peach'
                      ? 'bg-[#ffd6c9] text-[var(--cds-color-grey-975)]'
                      : 'bg-[#c8e8f0] text-[var(--cds-color-grey-975)]'
                  }`}
                  style={{
                    ...(pill.top != null ? { top: pill.top } : {}),
                    ...(pill.left != null ? { left: pill.left } : {}),
                    ...(pill.right != null ? { right: pill.right } : {}),
                    ...(pill.bottom != null ? { bottom: pill.bottom } : {}),
                  }}
                >
                  {pill.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 space-y-2">
              <h2
                id="skill-gap-main-heading"
                className="cds-subtitle-lg text-[var(--cds-color-grey-975)] sm:text-[1.375rem] sm:leading-tight sm:font-semibold"
              >
                {SKILL_GAP_COPY.sectionTitle}
              </h2>
              <p className="cds-body-secondary whitespace-pre-line text-[var(--cds-color-grey-600)] leading-relaxed max-w-3xl">
                {SKILL_GAP_COPY.intro}
              </p>
            </div>
            <button
              type="button"
              aria-expanded={true}
              aria-controls="skill-gap-tool-panel"
              onClick={() => setToolExpanded(false)}
              className="shrink-0 rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-200)] px-3 py-2 cds-body-secondary text-[var(--cds-color-grey-975)] hover:bg-[var(--cds-color-grey-25)]"
            >
              {SKILL_GAP_COPY.collapseSection}
            </button>
          </div>

          <div id="skill-gap-tool-panel">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Left: resume */}
        <div
          className="min-w-0 space-y-4"
          role="region"
          aria-label={SKILL_GAP_COPY.resumeHeading}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="cds-subtitle-md min-w-0 flex-1 text-[var(--cds-color-grey-975)]">
              {SKILL_GAP_COPY.resumeHeading}
            </h3>
            <div className="flex shrink-0 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                className="sr-only"
                aria-label={SKILL_GAP_COPY.uploadLabel}
                onChange={onFileChange}
              />
              <button
                type="button"
                onClick={openUploadModal}
                disabled={fileBusy}
                className="rounded-[var(--cds-border-radius-100)] bg-[var(--cds-color-grey-975)] px-4 py-2 font-semibold text-[var(--cds-color-white)] transition-colors hover:bg-[var(--cds-color-grey-900)] disabled:opacity-50 cds-action-secondary"
              >
                {fileBusy ? 'Reading…' : SKILL_GAP_COPY.uploadLabel}
              </button>
            </div>
          </div>
          <p className="cds-body-tertiary text-[var(--cds-color-grey-600)]">
            PDF or .txt — or paste below. Word (.doc/.docx) is not supported yet.
          </p>
          {fileError ? (
            <p className="cds-body-secondary text-[var(--cds-color-red-700)]" role="alert">
              {fileError}
            </p>
          ) : null}

          <textarea
            id="skill-gap-resume-field"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder={SKILL_GAP_COPY.pastePlaceholder}
            rows={14}
            className="w-full resize-y rounded-[var(--cds-border-radius-200)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-grey-25)] p-3 cds-body-secondary text-[var(--cds-color-grey-975)] placeholder:text-[var(--cds-color-grey-400)] focus:border-[var(--cds-color-blue-700)] focus:outline-none focus:ring-1 focus:ring-[var(--cds-color-blue-700)]"
            aria-label={SKILL_GAP_COPY.pastePlaceholder}
          />
        </div>

        {/* Right: job + results */}
        <div className="min-w-0 space-y-4" role="region" aria-label={SKILL_GAP_COPY.findRoleHeading}>
          <div className="rounded-[var(--cds-border-radius-200)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-white)]">
            <button
              type="button"
              id="skill-gap-job-details-heading"
              className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-[var(--cds-color-grey-25)]"
              aria-expanded={jobDetailsOpen}
              aria-controls="skill-gap-job-details-panel"
              onClick={() => setJobDetailsOpen((o) => !o)}
            >
              <span className="cds-subtitle-md text-[var(--cds-color-grey-975)]">
                {SKILL_GAP_COPY.findRoleHeading}
              </span>
              <span
                className="material-symbols-rounded ml-auto shrink-0 text-[var(--cds-color-grey-600)]"
                style={{ fontSize: 22 }}
                aria-hidden
              >
                {jobDetailsOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {jobDetailsOpen ? (
              <div
                id="skill-gap-job-details-panel"
                role="region"
                aria-labelledby="skill-gap-job-details-heading"
                className="space-y-4 border-t border-[var(--cds-color-grey-100)] px-4 py-4"
              >
                <div className="space-y-1.5">
                  <label htmlFor="skill-gap-job-url" className="cds-body-secondary text-[var(--cds-color-grey-975)]">
                    {SKILL_GAP_COPY.jobUrlLabel}
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="skill-gap-job-url"
                      type="url"
                      inputMode="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder={SKILL_GAP_COPY.jobUrlPlaceholder}
                      className="min-w-0 flex-1 rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-white)] px-3 py-2 cds-body-secondary text-[var(--cds-color-grey-975)] focus:border-[var(--cds-color-blue-700)] focus:outline-none focus:ring-1 focus:ring-[var(--cds-color-blue-700)]"
                    />
                    <button
                      type="button"
                      onClick={fetchJobPosting}
                      disabled={fetchBusy}
                      className="shrink-0 rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-blue-700)] px-4 py-2 font-semibold text-[var(--cds-color-blue-700)] hover:bg-[var(--cds-color-blue-25)] disabled:opacity-50 cds-action-secondary"
                    >
                      {fetchBusy ? 'Fetching…' : SKILL_GAP_COPY.fetchPosting}
                    </button>
                  </div>
                  {fetchError ? (
                    <p className="cds-body-tertiary text-[var(--cds-color-red-700)]" role="alert">
                      {fetchError}
                    </p>
                  ) : (
                    <p className="cds-body-tertiary text-[var(--cds-color-grey-600)]">
                      Many sites block automated fetches — paste the description if this fails.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="skill-gap-jd" className="cds-body-secondary text-[var(--cds-color-grey-975)]">
                    {SKILL_GAP_COPY.jobDescriptionLabel}
                  </label>
                  <textarea
                    id="skill-gap-jd"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder={SKILL_GAP_COPY.jobDescriptionPlaceholder}
                    className="h-[125px] min-h-[125px] w-full resize-y rounded-[var(--cds-border-radius-200)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-grey-25)] p-3 cds-body-secondary text-[var(--cds-color-grey-975)] placeholder:text-[var(--cds-color-grey-400)] focus:border-[var(--cds-color-blue-700)] focus:outline-none focus:ring-1 focus:ring-[var(--cds-color-blue-700)]"
                  />
                </div>

                <p className="cds-body-tertiary leading-relaxed text-[var(--cds-color-grey-600)]">
                  {SKILL_GAP_COPY.privacyNote}
                </p>

                {showTitleDisclaimer ? (
                  <p className="cds-body-tertiary italic text-[var(--cds-color-grey-600)]">
                    {SKILL_GAP_COPY.disclaimerJobTitleOnly}
                  </p>
                ) : null}

                {!geminiReady ? (
                  <p className="cds-body-secondary text-[var(--cds-color-grey-600)]" role="status">
                    {SKILL_GAP_COPY.geminiOffline}
                  </p>
                ) : null}

                {analyzeError ? (
                  <p className="cds-body-secondary text-[var(--cds-color-red-700)]" role="alert">
                    {analyzeError}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={runAnalyze}
                  disabled={analyzeBusy || !geminiReady}
                  className="w-full rounded-[var(--cds-border-radius-100)] bg-[#E85D75] px-5 py-2.5 font-semibold text-[var(--cds-color-white)] shadow-sm transition-colors hover:bg-[#d64f66] disabled:opacity-50 cds-action-secondary sm:w-auto"
                >
                  {analyzeBusy ? 'Analyzing…' : SKILL_GAP_COPY.analyze}
                </button>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 pt-2">
            <CollapsiblePanel
              id="found"
              title={SKILL_GAP_COPY.foundSkillsTitle}
              count={analysis?.foundSkills.length ?? 0}
              badgeClass="bg-[var(--cds-color-grey-100)] text-[var(--cds-color-grey-975)]"
              expanded={expanded.found}
              onToggle={() => toggle('found')}
              emptyMessage={SKILL_GAP_COPY.foundSkillsEmpty}
            >
              <SkillList items={analysis?.foundSkills ?? []} />
            </CollapsiblePanel>

            <CollapsiblePanel
              id="opportunities"
              title={SKILL_GAP_COPY.opportunitiesTitle}
              count={analysis?.skillOpportunities.length ?? 0}
              badgeClass="border border-[var(--cds-color-blue-200)] bg-[var(--cds-color-blue-25)] text-[var(--cds-color-grey-975)]"
              expanded={expanded.opportunities}
              onToggle={() => toggle('opportunities')}
              emptyMessage={SKILL_GAP_COPY.opportunitiesEmpty}
            >
              <SkillList items={analysis?.skillOpportunities ?? []} />
            </CollapsiblePanel>

            {showResumeDetailPanels ? (
              <>
                <CollapsiblePanel
                  id="key"
                  title={SKILL_GAP_COPY.keySkillsTitle}
                  count={analysis?.keySkills.length ?? 0}
                  badgeClass="bg-[var(--cds-color-green-100)] text-[var(--cds-color-green-800)]"
                  hint={SKILL_GAP_COPY.keySkillsHint}
                  expanded={expanded.key}
                  onToggle={() => toggle('key')}
                  emptyMessage="Run analysis to see key skills from your resume for this role."
                >
                  <SkillList items={analysis?.keySkills ?? []} />
                </CollapsiblePanel>

                <CollapsiblePanel
                  id="relevant"
                  title={SKILL_GAP_COPY.relevantSkillsTitle}
                  count={analysis?.relevantSkills.length ?? 0}
                  badgeClass="bg-[var(--cds-color-grey-100)] text-[var(--cds-color-grey-975)]"
                  hint={SKILL_GAP_COPY.relevantSkillsHint}
                  expanded={expanded.relevant}
                  onToggle={() => toggle('relevant')}
                  emptyMessage="Run analysis to see secondary relevant skills."
                >
                  <SkillList items={analysis?.relevantSkills ?? []} />
                </CollapsiblePanel>

                <CollapsiblePanel
                  id="unusual"
                  title={SKILL_GAP_COPY.unusualSkillsTitle}
                  count={analysis?.unusualResumeSkills.length ?? 0}
                  badgeClass="bg-[var(--cds-color-yellow-25)] text-[var(--cds-color-grey-975)] border border-[var(--cds-color-yellow-200)]"
                  hint={SKILL_GAP_COPY.unusualSkillsHint}
                  expanded={expanded.unusual}
                  onToggle={() => toggle('unusual')}
                  emptyMessage="Run analysis to see resume skills that are less typical for this role."
                >
                  <SkillList items={analysis?.unusualResumeSkills ?? []} />
                </CollapsiblePanel>
              </>
            ) : null}

            {analysis?.summaryNote ? (
              <p className="cds-body-tertiary text-[var(--cds-color-grey-600)] border-t border-[var(--cds-color-grey-100)] pt-3">
                {analysis.summaryNote}
              </p>
            ) : null}
          </div>
        </div>
      </div>
          </div>
        </>
      )}

      {uploadModalOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label={SKILL_GAP_COPY.uploadModalCloseLabel}
            onClick={closeUploadModal}
            disabled={fileBusy}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={uploadModalTitleId}
            className="relative w-full max-w-md rounded-[var(--cds-border-radius-200)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-white)] p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id={uploadModalTitleId} className="cds-subtitle-md text-[var(--cds-color-grey-975)]">
                {SKILL_GAP_COPY.uploadModalTitle}
              </h2>
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={fileBusy}
                className="rounded-[var(--cds-border-radius-100)] p-1 text-[var(--cds-color-grey-600)] transition-colors hover:bg-[var(--cds-color-grey-25)] hover:text-[var(--cds-color-grey-975)] disabled:opacity-50"
                aria-label={SKILL_GAP_COPY.uploadModalCloseLabel}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 22 }} aria-hidden>
                  close
                </span>
              </button>
            </div>
            <p className="cds-body-secondary mb-4 text-[var(--cds-color-grey-600)]">
              {SKILL_GAP_COPY.uploadModalSubtitle}
            </p>

            <div
              onDragEnter={onUploadDragEnter}
              onDragOver={onUploadDragOver}
              onDragLeave={onUploadDragLeave}
              onDrop={onUploadDrop}
              className={`flex flex-col items-center justify-center gap-3 rounded-[var(--cds-border-radius-200)] border-2 border-dashed px-4 py-10 text-center transition-colors ${
                dropActive
                  ? 'border-[var(--cds-color-blue-700)] bg-[var(--cds-color-blue-25)]'
                  : 'border-[var(--cds-color-grey-200)] bg-[var(--cds-color-grey-25)]'
              }`}
            >
              <span
                className="material-symbols-rounded text-[var(--cds-color-grey-600)]"
                style={{ fontSize: 40 }}
                aria-hidden
              >
                upload_file
              </span>
              <p className="cds-body-secondary text-[var(--cds-color-grey-700)]">
                {dropActive ? SKILL_GAP_COPY.uploadModalDropActive : SKILL_GAP_COPY.uploadModalDropHint}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={fileBusy}
                className="rounded-lg bg-[var(--cds-color-grey-975)] px-4 py-2 font-semibold text-[var(--cds-color-white)] transition-colors hover:bg-[var(--cds-color-grey-900)] disabled:opacity-50 cds-action-secondary"
              >
                {fileBusy ? 'Reading…' : SKILL_GAP_COPY.uploadModalChooseFile}
              </button>
            </div>

            <p className="cds-body-tertiary mt-3 text-[var(--cds-color-grey-600)]">
              PDF or .txt — Word (.doc/.docx) is not supported yet.
            </p>
            {fileError ? (
              <p className="cds-body-secondary mt-2 text-[var(--cds-color-red-700)]" role="alert">
                {fileError}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={fileBusy}
                className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-200)] px-4 py-2 cds-body-secondary text-[var(--cds-color-grey-975)] hover:bg-[var(--cds-color-grey-25)] disabled:opacity-50"
              >
                {SKILL_GAP_COPY.uploadModalCancel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

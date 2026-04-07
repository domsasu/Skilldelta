/** Hero image + floating pills for collapsed entry state */
export const SKILL_GAP_HERO = {
  imageSrc: '/career-field-collaboration.png',
  imageAlt: 'Professionals collaborating around data work',
} as const;

export const SKILL_GAP_FLOATING_PILLS: ReadonlyArray<{
  label: string;
  tone: 'peach' | 'cyan';
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}> = [
  { label: 'SQL', tone: 'cyan', top: '12%', left: '6%' },
  { label: 'Python', tone: 'peach', top: '8%', right: '10%' },
  { label: 'Data visualization', tone: 'cyan', top: '40%', left: '4%' },
  { label: 'Statistics', tone: 'peach', top: '36%', right: '8%' },
  { label: 'Excel', tone: 'cyan', bottom: '30%', left: '10%' },
  { label: 'Reporting', tone: 'peach', bottom: '12%', right: '14%' },
  { label: 'dbt', tone: 'cyan', top: '58%', left: '44%' },
];

export const SKILL_GAP_COPY = {
  sectionTitle: 'Skill Gap Tool',
  intro:
    'Ready for your next big role? Simply upload your resume and let us analyze the gaps\nto focus on between now and your dream job.',
  /** Short label so the entry CTA can match primary action width (e.g. 140px). */
  entryCta: 'Analyze gaps',
  entryCtaAriaLabel: 'Analyze my skill gaps',
  collapseSection: 'Minimize',
  resumeHeading: 'Enter your resume',
  findRoleHeading: 'Find role',
  jobRoleLinkLabel: 'Job posting link',
  jobRoleLinkPlaceholder: 'https://…',
  uploadRoleButton: 'Upload role',
  roleLinkUrlInvalid: 'Enter a valid https:// job posting URL.',
  /** Screen-reader / skeleton status while processing a pasted job link. */
  roleUploadLoadingStatus: 'Loading skill opportunities from your link…',
  roleUploadFocusHeading: 'Focus on these first',
  roleUploadAllHeading: 'All skill opportunity areas',
  jobRoleLinkHint:
    'Paste a public https job URL. We’ll outline focus areas you can prioritize before you apply.',
  uploadLabel: 'Upload resume',
  uploadModalTitle: 'Upload resume',
  uploadModalSubtitle:
    'Drag and drop a PDF or .txt file here, or choose a file from your computer.',
  uploadModalDropHint: 'Drop file here',
  uploadModalDropActive: 'Release to upload',
  uploadModalChooseFile: 'Choose file',
  uploadModalCancel: 'Cancel',
  uploadModalCloseLabel: 'Close',
  uploadModalInvalidDrop: 'Please use a PDF or .txt file.',
  pastePlaceholder: 'Type or paste your resume here…',
  jobDescriptionLabel: 'Paste job description',
  jobDescriptionPlaceholder: 'Paste the full job description text here…',
  analyze: 'Analyze skill gaps',
  privacyNote:
    'Your resume and job text are sent to Google Gemini for analysis. Do not paste confidential information you cannot share.',
  geminiOffline: 'Add GEMINI_API_KEY in .env.local to enable analysis.',
  foundSkillsTitle: 'Found skills',
  foundSkillsEmpty: 'Enter your resume on the left to see skills we can identify.',
  /** Shown under the Found skills header when the panel is collapsed and at least one skill exists. */
  foundSkillsCollapsedEncouragementOne: 'Great work, we found 1 skill across your resume.',
  /** Use "{count}" as the numeric placeholder (plural skills). */
  foundSkillsCollapsedEncouragementMany: 'Great work, we found {count} skills across your resume.',
  opportunitiesTitle: 'Skill opportunities',
  opportunitiesEmpty:
    'Paste a job link and click Upload role, or paste a description and run Analyze skill gaps.',
  disclaimerJobTitleOnly:
    'No job description was provided; opportunities are inferred from the job title and may be less precise.',
  /** Lead line above the upload preview skill list (18 demo items after file upload). */
  foundSkillsUploadPreviewLead: '18 skills found:',
  /** Screen-reader status while the Found skills panel shows a post-upload skeleton. */
  foundSkillsUploadLoadingStatus: 'Identifying skills from your resume…',
} as const;

/** Delay after text extraction before showing the upload preview list (skeleton during this window). */
export const SKILL_GAP_UPLOAD_PREVIEW_DELAY_MS = 1100;

/** Delay after Upload role before showing demo focus + opportunity lists. */
export const SKILL_GAP_ROLE_LINK_PREVIEW_DELAY_MS = 900;

/** Three areas to prioritize immediately (shown after Upload role). */
export const SKILL_GAP_ROLE_UPLOAD_FOCUS_NOW: readonly string[] = [
  'Stakeholder storytelling & executive-ready insights',
  'Advanced SQL (performance tuning, complex joins, reporting layers)',
  'Experimentation & metric design (A/B tests, trustworthy KPIs)',
];

/** Seven broader skill opportunity areas (shown after Upload role). */
export const SKILL_GAP_ROLE_UPLOAD_OPPORTUNITIES: readonly string[] = [
  'Business intelligence breadth (Power BI / Looker)',
  'Product analytics (funnels, cohorts, retention)',
  'Cloud data warehousing (BigQuery / Snowflake)',
  'Business KPI frameworks & OKRs',
  'Analytics engineering (dbt, pipelines)',
  'Causal inference basics',
  'Data privacy & ethics (GDPR / CCPA)',
];

/** Demo “found skills” list shown after a successful file upload (18 items). */
export const SKILL_GAP_UPLOAD_PREVIEW_SKILLS: readonly string[] = [
  'Python',
  'SQL (PostgreSQL)',
  'Tableau',
  'Excel (VBA/Macros)',
  'Pandas',
  'Scikit-Learn',
  'Exploratory Data Analysis (EDA)',
  'Hypothesis Testing',
  'Regression Analysis',
  'Time-Series Modeling',
  'Linear Algebra',
  'Probability',
  'Data Visualization',
  'Technical Documentation',
  'Cross-departmental Collaboration',
  'Data Integrity',
  'Trend Forecasting',
  '"Plain English" Translation',
];

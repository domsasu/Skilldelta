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
  jobUrlLabel: 'Job posting URL',
  jobUrlPlaceholder: 'https://…',
  fetchPosting: 'Fetch posting',
  jobDescriptionLabel: 'Or paste job description',
  jobDescriptionPlaceholder: 'Paste the full job description text here…',
  analyze: 'Analyze skill gaps',
  privacyNote:
    'Your resume and job text are sent to Google Gemini for analysis. Fetching a URL sends the request through our server. Do not paste confidential information you cannot share.',
  geminiOffline: 'Add GEMINI_API_KEY in .env.local to enable analysis.',
  foundSkillsTitle: 'Found skills',
  foundSkillsEmpty: 'Enter your resume on the left to see skills we can identify.',
  opportunitiesTitle: 'Skill opportunities',
  opportunitiesEmpty: 'Add a job description or fetch a posting to see skill gaps to work on.',
  keySkillsTitle: 'Key skills',
  keySkillsHint: 'Skills from your resume that strongly match the target role.',
  relevantSkillsTitle: 'Relevant skills',
  relevantSkillsHint: 'Skills from your resume that are still relevant but less central.',
  unusualSkillsTitle: 'Low-match resume skills',
  unusualSkillsHint: 'Skills on your resume that are less typical for this role.',
  disclaimerJobTitleOnly:
    'No job description was provided; opportunities are inferred from the job title and may be less precise.',
} as const;

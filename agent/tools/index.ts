import { analyzeJobTool } from './job-analysis-tool';
import { extractResumeDataTool } from './resume-extraction-tool';

export { analyzeJobTool } from './job-analysis-tool';
export { extractResumeDataTool } from './resume-extraction-tool';
export type { ResumeData, ContactInfo, Experience, Education, Skill } from './resume-extraction-tool';

export const resumeOptimizerTools = {
  analyzeJobTool,
  extractResumeDataTool
};
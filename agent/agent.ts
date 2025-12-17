import { generateText, LanguageModel, stepCountIs, ToolSet } from 'ai';
import { google } from '@ai-sdk/google';
import { resumeOptimizerTools } from './tools';
import { RESUME_OPTIMIZER_SYSTEM_PROMPT } from './system-prompt';
import type { ResumeData } from './tools';

export interface ResumeOptimizationInput {
  resumeText: string;
  jobDescription: string;
}

export interface ResumeOptimizationResult {
  success: boolean;
  originalResumeData?: ResumeData;
  optimizedResumeData?: ResumeData;
  coverLetter?: string;
  jobAnalysis?: any;
  error?: string;
  executionTime?: number;
  toolsUsed?: string[];
}

export interface ProgressUpdate {
  message: string;
  step?: number;
  totalSteps?: number;
  toolsUsed?: string[];
}

export class ResumeOptimizerAgent {
  private model = google('gemini-2.5-pro');
  private allTools: ToolSet = {};

  constructor() {
    this.initializeTools();
  }

  private initializeTools(): void {
    this.allTools = {
      ...resumeOptimizerTools
    };

    const toolNames = Object.keys(this.allTools);
    console.log(`🔧 Resume Optimizer Agent initialized with ${toolNames.length} tools`);
    console.log(`📊 Available tools: ${toolNames.join(', ')}`);
  }

  async optimizeResume(
    input: ResumeOptimizationInput,
    onProgress?: (update: ProgressUpdate) => void
  ): Promise<ResumeOptimizationResult> {
    const startTime = Date.now();
    let stepsUsed = 0;
    const toolsUsed: string[] = [];

    try {
      console.log('🚀 RESUME OPTIMIZER AGENT: Starting optimization');
      console.log('📊 Input lengths:', {
        resumeText: input.resumeText.length,
        jobDescription: input.jobDescription.length
      });

      onProgress?.({
        message: '🚀 Starting resume optimization for target job...',
        step: 1,
        totalSteps: 1
      });

      const modelToUse: LanguageModel = this.model;

      // Execute the optimization process
      let result;
      try {
        console.log('🚀 Starting generateText call...');
        result = await generateText({
          model: modelToUse,
          system: RESUME_OPTIMIZER_SYSTEM_PROMPT,
          prompt: `Please optimize this resume for the given job opportunity and generate a professional cover letter:

RESUME TEXT:
${input.resumeText}

JOB DESCRIPTION:
${input.jobDescription}

Please do the following:
1. First use analyzeJobTool to analyze the job description
2. Then use extractResumeDataTool to extract the resume data
3. Create an optimized version of the resume using insights from both tools
4. Generate a professional cover letter that matches the candidate's experience with the job requirements

The cover letter should:
- Be professional and engaging
- Highlight relevant experience from the resume that matches the job requirements
- Show genuine interest in the role and company
- Be approximately 250-300 words
- Include a proper greeting and closing
- Be ready to copy and paste into an email

Please provide both the optimized resume data AND the cover letter in your final response.`,
          tools: this.allTools,
          stopWhen: stepCountIs(10),
          onStepFinish: (stepResult) => {
            const { toolCalls, text } = stepResult;

            if (toolCalls && toolCalls.length > 0) {
              const newTools = toolCalls.map(tc => tc.toolName);
              toolsUsed.push(...newTools);

              if (newTools.includes('optimizeResumeForJobTool')) {
                onProgress?.({
                  message: '✨ Optimizing resume for target job...',
                  step: 1,
                  totalSteps: 1,
                  toolsUsed: newTools
                });
              }
            }
          }
        });
        console.log('✅ generateText completed successfully');
      } catch (generateError) {
        console.error('❌ generateText failed with error:', generateError);
        throw generateError;
      }

      console.log('🔍 DEBUG: Checking result structure...');
      console.log('📊 result.toolResults length:', result.toolResults?.length || 0);
      console.log('📊 result.finishReason:', result.finishReason);
      console.log('📊 result.text preview:', result.text);

      // Extract optimized resume and cover letter from AI response text
      let optimizedResumeData: ResumeData | undefined;
      let coverLetter: string | undefined;

      console.log('🔍 Looking for optimized resume and cover letter in AI response...');

      // Look for JSON block in the response text
      const jsonMatch = result.text.match(/```json\s*({[\s\S]*?})\s*```/);

      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[1]);
          if (parsedData.optimizedResumeData) {
            optimizedResumeData = parsedData.optimizedResumeData;
            console.log('✅ Optimized resume extracted from AI response');
          } else {
            console.log('❌ No optimizedResumeData found in JSON response');
          }
        } catch (parseError) {
          console.error('❌ Failed to parse JSON from AI response:', parseError);
          console.log('Raw JSON match:', jsonMatch[1]);
        }
      } else {
        console.log('❌ No JSON block found in AI response');
        console.log('Response text preview:', result.text.substring(0, 500));
      }

      // Extract cover letter from the response
      const coverLetterMatch = result.text.match(/(?:COVER LETTER|Cover Letter):\s*([\s\S]*?)(?:\n\n(?:[A-Z]|$)|$)/i) ||
                              result.text.match(/Dear [\s\S]*?(?:Sincerely|Best regards|Kind regards)[\s\S]*?$/i);

      if (coverLetterMatch) {
        coverLetter = coverLetterMatch[0].trim();
        console.log('✅ Cover letter extracted from AI response');
      } else {
        console.log('❌ No cover letter found in AI response');
      }

      onProgress?.({
        message: '✅ Resume optimization completed!',
        step: 1,
        totalSteps: 1
      });

      console.log('✅ Resume optimization successful');
      console.log('📊 Results:', {
        hasOptimizedData: !!optimizedResumeData,
        toolsUsed: [...new Set(toolsUsed)]
      });

      return {
        success: true,
        optimizedResumeData,
        coverLetter,
        executionTime: Date.now() - startTime,
        toolsUsed: [...new Set(toolsUsed)]
      };

    } catch (error) {
      console.error('❌ Resume optimization error:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: Date.now() - startTime,
        toolsUsed: [...new Set(toolsUsed)]
      };
    }
  }

  getAvailableTools(): string[] {
    return Object.keys(this.allTools);
  }

  getToolInventory(): { total: number; allTools: string[] } {
    const allTools = Object.keys(this.allTools);
    return { total: allTools.length, allTools };
  }
}
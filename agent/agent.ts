import { generateText, LanguageModel, stepCountIs } from 'ai';
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
  private model = google('gemini-2.5-flash');
  private allTools: Record<string, any> = {};

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
          prompt: `Please optimize this resume for the given job opportunity:

RESUME TEXT:
${input.resumeText}

JOB DESCRIPTION:
${input.jobDescription}

First use analyzeJobTool to analyze the job, then use extractResumeDataTool to extract the resume data, then create an optimized version yourself using the insights from both tools.`,
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

      // Extract optimized resume from AI response text
      let optimizedResumeData: ResumeData | undefined;

      console.log('🔍 Looking for optimized resume in AI response...');

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
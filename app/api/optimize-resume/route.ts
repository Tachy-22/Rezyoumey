import { ResumeOptimizerAgent } from '@/agent';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || !jobDescription) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing resumeText or jobDescription' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📥 Received optimization request');
    console.log('📊 Resume text length:', resumeText.length);
    console.log('📊 Job description length:', jobDescription.length);

    // Set up Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const sendUpdate = (data: { type: string; message?: string; step?: number; totalSteps?: number; toolsUsed?: string[]; success?: boolean; optimizedResumeData?: unknown; coverLetter?: string; executionTime?: number; error?: string }) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // Initialize the resume optimizer agent
        const agent = new ResumeOptimizerAgent();

        // Run the optimization with progress updates
        agent.optimizeResume(
          { resumeText, jobDescription },
          (update) => {
            console.log('🔄 Progress:', update.message);
            sendUpdate({
              type: 'progress',
              message: update.message,
              step: update.step,
              totalSteps: update.totalSteps,
              toolsUsed: update.toolsUsed
            });
          }
        ).then((result) => {
          console.log('📤 Sending optimization result');
          console.log('✅ Success:', result.success);

          if (result.success) {
            sendUpdate({
              type: 'complete',
              success: true,
              optimizedResumeData: result.optimizedResumeData,
              coverLetter: result.coverLetter,
              executionTime: result.executionTime,
              toolsUsed: result.toolsUsed
            });
          } else {
            sendUpdate({
              type: 'error',
              success: false,
              error: result.error || 'Optimization failed'
            });
          }
          controller.close();
        }).catch((error) => {
          console.error('❌ API Error:', error);
          sendUpdate({
            type: 'error',
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
          });
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
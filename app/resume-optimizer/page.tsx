'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileInput } from '@/components/ui/file-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Sparkles, Download } from 'lucide-react';
import { toast } from 'sonner';
import ResumeTemplate1 from '@/components/templates/ResumeTemplate1';
import { extractTextFromPDFClient } from '@/lib/pdf-client-utils';
import { extractTextFromPDF } from '@/lib/pdf-utils';
import { useReactToPrint } from 'react-to-print';

interface ResumeData {
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
    github?: string;
  };
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description?: string;
    achievements?: string[];
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    graduationDate?: string;
    location?: string;
    gpa?: string;
    honors?: string[];
  }>;
  skills: Array<{
    name: string;
    category: string;
    level?: string;
  }>;
}

export default function ResumeOptimizerPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setResumeFile(file);
    setStatusMessage('Converting PDF to text...');

    try {
      // Convert PDF to text using server-side utility
      const text = await extractTextFromPDF(file);
      setResumeText(text);
      toast.success('PDF converted to text successfully');
    } catch (error) {
      toast.error('Failed to convert PDF to text');
      console.error('PDF conversion error:', error);
    }
  };


  const optimizeResume = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error('Please provide both resume text and job description');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatusMessage('Starting resume optimization...');

    try {
      const response = await fetch('/api/optimize-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize resume');
      }

      // Handle Server-Sent Events
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                setStatusMessage(data.message);
                // Update progress based on step
                if (data.step && data.totalSteps) {
                  setProgress((data.step / data.totalSteps) * 90); // Keep 10% for completion
                } else {
                  setProgress(prev => Math.min(prev + 10, 90));
                }
              } else if (data.type === 'complete') {
                if (data.success && data.optimizedResumeData) {
                  setOptimizedResume(data.optimizedResumeData);
                  setProgress(100);
                  setStatusMessage('Resume optimization completed!');
                  toast.success('Resume optimized successfully!');
                } else {
                  throw new Error(data.error || 'Optimization failed');
                }
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Optimization failed');
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Failed to optimize resume. Please try again.');
      setStatusMessage('Optimization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resumeRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `optimized-resume-${optimizedResume?.contactInfo.name.replace(/\s+/g, '-').toLowerCase() || 'resume'} PCV`,
    onAfterPrint: () => {
      toast.success('Resume PDF downloaded successfully!');
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    },
  });

  const downloadOptimizedResume = () => {
    if (!optimizedResume) return;

    toast.success('Generating PDF... Please wait');
    handlePrint();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resume Optimizer</h1>
          <p className="text-lg text-gray-600">Upload your resume and job description to get an optimized version tailored for the position</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="space-y-6 col-span-1">
            {/* Resume Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Resume
                </CardTitle>
                <CardDescription>
                  Upload your resume as a PDF file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resume-upload">Resume PDFs</Label>
                    <FileInput
                      id="resume-upload"
                      accept=".pdf"
                      onFileChange={(file) => {
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      className="mt-1"
                    />
                  </div>

                  {/* {resumeText && (
                    <div>
                      <Label htmlFor="resume-text">Resume Text (Preview)</Label>
                      <Textarea
                        id="resume-text"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Your resume text will appear here..."
                        className="h-40 mt-1"
                      />
                    </div>
                  )} */}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Job Description
                </CardTitle>
                <CardDescription>
                  Paste the job description you want to optimize for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="h-60"
                />
              </CardContent>
            </Card>

            {/* Optimize Button */}
            <Button
              onClick={optimizeResume}
              disabled={isProcessing || !resumeText.trim() || !jobDescription.trim()}
              className="w-full h-12 text-lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {isProcessing ? 'Optimizing...' : 'Optimize Resume'}
            </Button>

            {/* Progress Display */}
            {isProcessing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-gray-600">{statusMessage}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className=" col-span-2 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-0 ">
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Optimized Resume
              </span>
              <Button onClick={downloadOptimizedResume} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            {optimizedResume ? (
              <div ref={resumeRef} className="print:scale-100 print:w-auto print:h-auto ">
                <ResumeTemplate1 
                  resumeData={optimizedResume} 
                //  editable={true}
                 // onUpdate={setOptimizedResume}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Upload your resume and job description, then click "Optimize Resume" to see the optimized version here.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
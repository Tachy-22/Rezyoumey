'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileInput } from '@/components/ui/file-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Sparkles, Download } from 'lucide-react';
import { toast } from 'sonner';
import ResumeTemplate1 from '@/components/templates/ResumeTemplate1';
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
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }


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

      const result = await response.json();

      if (result.success && result.optimizedResumeData) {
        setOptimizedResume(result.optimizedResumeData);
        toast.success('Resume optimized successfully!');
      } else {
        throw new Error(result.error || 'Optimization failed');
      }

    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Failed to optimize resume. Please try again.');
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
          </div>

          {/* Results Section */}
          <div className=" col-span-2">
            {optimizedResume ? (
              <Card className='border'>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Optimized Resume
                    </span>
                    <Button onClick={downloadOptimizedResume} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={resumeRef} className="print:scale-100 print:w-auto print:h-auto">
                    <ResumeTemplate1 resumeData={optimizedResume || undefined} />
                  </div>
                </CardContent>
              </Card>
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
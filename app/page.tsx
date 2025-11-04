'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Sparkles, Download, Copy, Mail, Edit3, Eye, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import ResumeTemplate1 from '@/components/templates/ResumeTemplate1';
import EditableResume from '@/components/EditableResume';
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
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploadedFile(file);
    setIsExtracting(true);
    setStatusMessage('Converting PDF to text...');

    try {
      // Convert PDF to text using server-side utility
      const text = await extractTextFromPDF(file);
      setResumeText(text);
      setIsExtracting(false);
      toast.success('PDF converted to text successfully');
      console.log('Resume text extracted, length:', text.length);
    } catch (error) {
      setIsExtracting(false);
      setUploadedFile(null);
      toast.error('Failed to convert PDF to text');
      console.error('PDF conversion error:', error);
    }
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setResumeText('');
    setStatusMessage('');
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
                  setCoverLetter(data.coverLetter || null);
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

  const copyCoverLetter = () => {
    if (!coverLetter) return;

    navigator.clipboard.writeText(coverLetter);
    toast.success('Cover letter copied to clipboard!');
  };

  const handleResumeEdit = (updatedData: ResumeData) => {
    setOptimizedResume(updatedData);
    setIsEditMode(false);
    toast.success('Resume updated successfully!');
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
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
                  {!uploadedFile ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-stone-900 transition-colors cursor-pointer"
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer.files;
                        if (files?.[0]) handleFileUpload(files[0]);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById('resume-upload')?.click()}
                    >
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-24 bg-white rounded-lg flex flex-col items-center justify-center mb-4">
                          <img 
                            src="/pdf-icon.svg" 
                            alt="PDF Icon" 
                            className="w-20 h-24 mb-1"
                          />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload PDF Resume</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Drag and drop your PDF file here, or click to browse
                        </p>
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Choose PDF File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-14 bg-white rounded-lg flex flex-col items-center justify-center ">
                            <img 
                              src="/pdf-icon.svg" 
                              alt="PDF Icon" 
                              className="w-12 h-12"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                            <p className="text-gray-500 text-sm">
                              {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                            <div className="flex items-center space-x-2 text-sm">

                              {isExtracting ? (
                                <div className="flex items-center text-blue-600">
                                  <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-1"></div>
                                  Extracting text...
                                </div>
                              ) : resumeText ? (
                                <div className="flex items-center text-g-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Text extracted ({resumeText.length} characters)
                                </div>
                              ) : (
                                <div className="flex items-center text-red-600">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Extraction failed
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleFileRemove}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
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
          <div className="col-span-2">
            {optimizedResume ? (
              <Tabs defaultValue="resume" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="grid w-fit grid-cols-2">
                    <TabsTrigger value="resume" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Resume
                    </TabsTrigger>
                    {coverLetter && (
                      <TabsTrigger value="cover-letter" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Cover Letter
                      </TabsTrigger>
                    )}
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={toggleEditMode}
                      variant="outline"
                      size="sm"
                      className={isEditMode ? "bg-blue-50 border-blue-200" : ""}
                    >
                      {isEditMode ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          View Resume
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Resume
                        </>
                      )}
                    </Button>
                    <Button onClick={downloadOptimizedResume} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>

                <TabsContent value="resume" className="mt-0">
                  {isEditMode ? (
                    <Card>
                      <CardContent className="pt-6">
                        <EditableResume
                          resumeData={optimizedResume}
                          onSave={handleResumeEdit}
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <div ref={resumeRef} className="print:scale-100 print:w-auto print:h-auto">
                      <ResumeTemplate1
                        resumeData={optimizedResume}
                      />
                    </div>
                  )}
                </TabsContent>

                {coverLetter && (
                  <TabsContent value="cover-letter" className="mt-0">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Cover Letter
                          </CardTitle>
                          <Button onClick={copyCoverLetter} variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy to Clipboard
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-md border min-h-[400px]">
                          {coverLetter}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Upload your resume and job description, then click &quot;Optimize Resume&quot; to see the optimized version here.
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
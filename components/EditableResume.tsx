'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, Edit3 } from 'lucide-react';

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

interface EditableResumeProps {
  resumeData: ResumeData;
  onSave: (updatedData: ResumeData) => void;
}

export default function EditableResume({ resumeData, onSave }: EditableResumeProps) {
  const [editedData, setEditedData] = useState<ResumeData>(JSON.parse(JSON.stringify(resumeData)));

  const updateContactInfo = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  const updateSummary = (value: string) => {
    setEditedData(prev => ({
      ...prev,
      summary: value
    }));
  };

  const updateExperience = (index: number, field: string, value: string | string[]) => {
    setEditedData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addExperience = () => {
    setEditedData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: '',
          company: '',
          startDate: '',
          endDate: '',
          location: '',
          description: '',
          achievements: []
        }
      ]
    }));
  };

  const removeExperience = (index: number) => {
    setEditedData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      education: prev.education?.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      ) || []
    }));
  };

  const addEducation = () => {
    setEditedData(prev => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          degree: '',
          institution: '',
          graduationDate: '',
          location: '',
          gpa: '',
          honors: []
        }
      ]
    }));
  };

  const removeEducation = (index: number) => {
    setEditedData(prev => ({
      ...prev,
      education: prev.education?.filter((_, i) => i !== index) || []
    }));
  };

  const updateSkills = (skillsText: string) => {
    const skillsArray = skillsText.split('\n').filter(line => line.trim()).map(line => {
      const [category, ...skillNames] = line.split(':');
      if (category && skillNames.length > 0) {
        const skills = skillNames.join(':').split(',').map(skill => skill.trim()).filter(Boolean);
        return skills.map(skill => ({
          name: skill,
          category: category.trim(),
          level: ''
        }));
      }
      return [];
    }).flat();
    
    setEditedData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const getSkillsText = () => {
    const skillsByCategory = editedData.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill.name);
      return acc;
    }, {} as Record<string, string[]>);

    return Object.entries(skillsByCategory)
      .map(([category, skills]) => `${category}: ${skills.join(', ')}`)
      .join('\n');
  };

  const handleSave = () => {
    onSave(editedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Edit Resume
        </h3>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={editedData.contactInfo.name}
                onChange={(e) => updateContactInfo('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedData.contactInfo.email}
                onChange={(e) => updateContactInfo('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editedData.contactInfo.phone || ''}
                onChange={(e) => updateContactInfo('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editedData.contactInfo.location || ''}
                onChange={(e) => updateContactInfo('location', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={editedData.contactInfo.linkedin || ''}
                onChange={(e) => updateContactInfo('linkedin', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={editedData.contactInfo.website || ''}
                onChange={(e) => updateContactInfo('website', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedData.summary || ''}
            onChange={(e) => updateSummary(e.target.value)}
            placeholder="Write a brief professional summary..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Experience</CardTitle>
            <Button onClick={addExperience} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {editedData.experience.map((exp, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Experience {index + 1}</h4>
                <Button
                  onClick={() => removeExperience(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Job Title</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    value={exp.startDate}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    value={exp.endDate || ''}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    placeholder="Present"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Location</Label>
                  <Input
                    value={exp.location || ''}
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Achievements (one per line)</Label>
                  <Textarea
                    value={exp.achievements?.join('\n') || ''}
                    onChange={(e) => updateExperience(index, 'achievements', e.target.value.split('\n').filter(line => line.trim()))}
                    placeholder="• Achievement 1&#10;• Achievement 2&#10;• Achievement 3"
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Education</CardTitle>
            <Button onClick={addEducation} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {editedData.education?.map((edu, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Education {index + 1}</h4>
                <Button
                  onClick={() => removeEducation(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Institution</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Graduation Date</Label>
                  <Input
                    value={edu.graduationDate || ''}
                    onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>GPA</Label>
                  <Input
                    value={edu.gpa || ''}
                    onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Location</Label>
                  <Input
                    value={edu.location || ''}
                    onChange={(e) => updateEducation(index, 'location', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-4">No education entries. Click &quot;Add Education&quot; to get started.</p>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>
            Format: Category: skill1, skill2, skill3 (one category per line)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={getSkillsText()}
            onChange={(e) => updateSkills(e.target.value)}
            placeholder="Programming Languages: JavaScript, Python, Java&#10;Frameworks: React, Node.js, Express&#10;Databases: MongoDB, PostgreSQL, MySQL"
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
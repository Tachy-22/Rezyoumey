import { MapPin, Mail, Phone, Linkedin, Globe } from "lucide-react";

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

interface ResumeProps {
    resumeData?: ResumeData;
}

const Resume = ({ resumeData }: ResumeProps) => {
    // Use provided data or fall back to default
    const data = resumeData as ResumeData
    const { contactInfo, summary, experience, education, skills } = data;

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
            <div
                className="bg-white w-[210mm] h-[297mm] p-[15mm shadow-l font-['Lora',serif] text-[#333333] leading-relaxed overflow-hidden"
                style={{
                    fontSize: '9pt',
                    lineHeight: '1.3',
                }}
            >
                {/* Header */}
                <header className="text-center mb-3">
                    <h1 className="text-[26pt] font-normal mb-1.5 tracking-tight" style={{ fontWeight: 400 }}>
                        {contactInfo.name}
                    </h1>
                    <div className="flex items-center justify-center gap-2.5 text-[8pt] flex-wrap">
                        {contactInfo.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{contactInfo.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{contactInfo.email}</span>
                        </div>
                        {contactInfo.phone && (
                            <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{contactInfo.phone}</span>
                            </div>
                        )}
                        {contactInfo.linkedin && (
                            <div className="flex items-center gap-1">
                                <Linkedin className="w-3 h-3" />
                                <span>{contactInfo.linkedin}</span>
                            </div>
                        )}
                        {contactInfo.website && (
                            <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                <span>{contactInfo.website}</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Summary */}
                {summary && (
                    <section className="mb-3">
                        <h2 className="text-[11pt] font-bold uppercase mb-1.5 pb-0.5 tracking-wide" style={{borderBottom: '1px solid #000000'}}>
                            SUMMARY
                        </h2>
                        <p className="text-[9pt] leading-[1.35] text-justify">
                            {summary}
                        </p>
                    </section>
                )}

                {/* Experience */}
                {experience && experience.length > 0 && (
                    <section className="mb-3">
                        <h2 className="text-[11pt] font-bold uppercase mb-1.5 pb-0.5 tracking-wide" style={{borderBottom: '1px solid #000000'}}>
                            EXPERIENCE
                        </h2>

                        {experience.map((job, index) => (
                            <div key={index} className={index < experience.length - 1 ? "mb-2.5" : "mb-2"}>
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="text-[10pt] font-bold">{job.title}</h3>
                                    <span className="text-[8pt] font-bold">
                                        {job.startDate} - {job.endDate || "Present"}
                                        {job.location && `, ${job.location}`}
                                    </span>
                                </div>
                                <div className="text-[9pt] font-semibold mb-1">{job.company}</div>
                               
                               {job.achievements && job.achievements.length > 0 ? (
                                    <ul className="list-none space-y-0.5 text-[8pt] leading-[1.35]">
                                        {job.achievements.map((achievement, achIndex) => (
                                            <li key={achIndex} className="pl-3 relative before:content-['•'] before:absolute before:left-0">
                                                {achievement}
                                            </li>
                                        ))}
                                    </ul>
                                ) : job.description ? (
                                    <ul className="list-none space-y-0.5 text-[8pt] leading-[1.35]">
                                        {job.description.split('.').filter(sentence => sentence.trim()).map((sentence, sentIndex) => (
                                            <li key={sentIndex} className="pl-3 relative before:content-['•'] before:absolute before:left-0">
                                                {sentence.trim()}.
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        ))}
                    </section>
                )}

                {/* Education */}
                {education && education.length > 0 && (
                    <section className="mb-3">
                        <h2 className="text-[11pt] font-bold uppercase mb-1.5 pb-0.5 tracking-wide" style={{borderBottom: '1px solid #000000'}}>
                            EDUCATION
                        </h2>
                        {education.map((edu, index) => (
                            <div key={index} className="mb-1">
                                <h3 className="text-[10pt] font-bold">{edu.degree}</h3>
                                <p className="text-[8pt]">
                                    {edu.institution}
                                    {edu.location && ` • ${edu.location}`}
                                    {edu.graduationDate && ` • ${edu.graduationDate}`}
                                    {edu.gpa && ` • ${edu.gpa}`}
                                </p>
                            </div>
                        ))}
                    </section>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                    <section>
                        <h2 className="text-[11pt] font-bold uppercase mb-1.5 pb-0.5 tracking-wide" style={{borderBottom: '1px solid #000000'}}>
                            SKILLS
                        </h2>
                        <div className="space-y-0.5 text-[8pt]">
                            {Object.entries(
                                skills.reduce((acc, skill) => {
                                    if (!acc[skill.category]) {
                                        acc[skill.category] = [];
                                    }
                                    acc[skill.category].push(skill.name);
                                    return acc;
                                }, {} as Record<string, string[]>)
                            ).map(([category, skillNames], index) => (
                                <p key={index}>
                                    <span className="font-semibold">{category}:</span> {skillNames.join(', ')}
                                </p>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Resume;
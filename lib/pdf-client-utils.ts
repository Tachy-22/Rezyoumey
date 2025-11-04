// Client-side PDF text extraction utility
export async function extractTextFromPDFClient(file: File): Promise<string> {
  // For now, return sample text since we need a browser-compatible PDF library
  // In production, you'd use a library like PDF.js or react-pdf
  
 // console.log('Processing PDF file:', file.name, 'Size:', file.size);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return sample resume text for demo purposes
  const sampleText = [
    'John Doe',
    'Software Engineer',
    'john.doe@email.com | +1 (555) 123-4567 | New York, NY',
    'LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe',
    '',
    'SUMMARY',
    'Experienced software developer with 4+ years of experience in building modern web applications using React, Node.js, and cloud technologies. Passionate about creating scalable solutions and delivering high-quality code.',
    '',
    'EXPERIENCE',
    '',
    'Software Developer | Tech Solutions Inc. | Jan 2020 - Present | New York, NY',
    '• Developed and maintained web applications using React, TypeScript, and Node.js',
    '• Built responsive user interfaces serving 10,000+ active users',
    '• Improved application performance by 40% through code optimization',
    '• Collaborated with cross-functional teams in Agile environment',
    '',
    'Junior Frontend Developer | Digital Agency | Jun 2018 - Dec 2019 | New York, NY',
    '• Created user interfaces using HTML, CSS, and JavaScript',
    '• Developed 25+ responsive web pages',
    '• Integrated REST APIs for dynamic content management',
    '',
    'EDUCATION',
    '',
    'Bachelor of Science in Computer Science | New York University | May 2018 | New York, NY',
    '',
    'SKILLS',
    '• Programming Languages: JavaScript, TypeScript, Python, Java',
    '• Frontend: React, HTML, CSS, Tailwind CSS',
    '• Backend: Node.js, Express.js, REST APIs',
    '• Databases: MongoDB, PostgreSQL',
    '• Tools: Git, Docker, AWS, Figma'
  ].join('\n');
  
  return sampleText;
}
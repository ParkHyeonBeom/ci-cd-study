const skillCategories = [
  {
    category: 'Salesforce',
    skills: [
      'Commerce Cloud',
      'Sales Cloud',
      'Experience Cloud',
      'Lightning Platform',
      'Data Cloud',
      'Agentforce',
    ],
  },
  {
    category: 'Frontend',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS'],
  },
  {
    category: 'Backend',
    skills: ['Django', 'Python', 'REST API', 'Node.js'],
  },
  {
    category: 'Integration',
    skills: ['3PL Integration', 'Kakao API', 'Email Automation', 'Barcode API'],
  },
  {
    category: 'Data & Analytics',
    skills: ['Data Pipeline', '3D Visualization', 'Dashboard', 'Data Parsing'],
  },
];

export function Skills() {
  return (
    <section id="skills" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
          Skills
        </h2>
        <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
          프로젝트에서 활용한 기술 스택입니다.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category) => (
            <div
              key={category.category}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-brand-500/30 transition-all duration-300"
            >
              <h3 className="text-brand-400 font-semibold mb-4">
                {category.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-zinc-800/80 text-zinc-300 text-sm rounded-lg hover:bg-brand-600/20 hover:text-brand-300 transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

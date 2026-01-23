const profileInfo = [
  { label: '이름', value: '박현범' },
  { label: '연령', value: '만 26세' },
  { label: '경력', value: '1년 7개월' },
  { label: '학력', value: '한서대학교 항공소프트웨어공학과' },
  { label: '재직', value: 'KUSRC' },
];

const techStack = {
  'Salesforce': ['Sales Cloud', 'Commerce Cloud', 'Experience Cloud', 'Data Cloud'],
  'Backend': ['Java', 'Spring Boot', 'Spring Security', 'JPA', 'QueryDSL'],
  'DevOps': ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'AWS'],
  'MSA': ['Kafka', 'Eureka', 'Gateway'],
};

const certifications = [
  'Salesforce Admin',
  'Data Cloud Consultant',
  'AI Associate',
  'Agentforce Specialist',
];

export function About() {
  return (
    <section id="about" className="py-24 px-5 bg-[#F5F5F5]">
      <div className="max-w-[960px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold rounded mb-6">
            About
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            About Me
          </h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Profile
            </h3>
            <dl className="space-y-4">
              {profileInfo.map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <dt className="text-gray-500 text-sm">{item.label}</dt>
                  <dd className="text-gray-900 font-semibold text-sm">{item.value}</dd>
                </div>
              ))}
            </dl>

            {/* Certifications */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-4">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <span key={cert} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="lg:col-span-3 bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              Tech Stack
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {Object.entries(techStack).map(([category, skills]) => (
                <div key={category}>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const profileInfo = {
  name: '박현범',
  company: 'KUSRC',
  age: '만 26세',
  education: '한서대학교 항공소프트웨어공학과 학사',
  experience: '1년 7개월',
  grade: 'Junior',
  specialty: 'Salesforce / Web Based Backend',
};

const certifications = [
  {
    name: 'Salesforce Admin',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: 'Data Cloud Consultant',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    name: 'AI Associate',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    name: 'Agentforce Specialist',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export function About() {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
          About Me
        </h2>
        <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
          Salesforce 생태계와 웹 개발 역량을 갖춘 개발자입니다.
        </p>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Profile Info */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              Profile
            </h3>
            <dl className="space-y-4">
              {Object.entries(profileInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                  <dt className="text-zinc-500 text-sm capitalize">
                    {key === 'name' && '이름'}
                    {key === 'company' && '재직회사'}
                    {key === 'age' && '연령'}
                    {key === 'education' && '학력'}
                    {key === 'experience' && '경력'}
                    {key === 'grade' && '기술등급'}
                    {key === 'specialty' && '전문분야'}
                  </dt>
                  <dd className="text-white font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">
              Certifications
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {certifications.map((cert, index) => (
                <div
                  key={cert.name}
                  className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-brand-500/50 hover:glow-sm transition-all duration-300 stagger-${index + 1}`}
                >
                  <div className="text-brand-400 mb-3">{cert.icon}</div>
                  <h4 className="text-white font-medium text-sm">
                    {cert.name}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

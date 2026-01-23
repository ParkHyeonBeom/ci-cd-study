const highlights = [
  {
    id: 1,
    title: 'Salesforce 개발',
    description: 'Sales Cloud, Commerce Cloud, Experience Cloud 등 Salesforce 생태계 전반의 개발 및 커스터마이징 경험이 있습니다.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    tags: ['Sales Cloud', 'Commerce Cloud', 'Experience Cloud', 'Data Cloud'],
  },
  {
    id: 2,
    title: 'AI Native 개발',
    description: 'Claude Code, Cursor 등 AI Agent를 활용한 개발 워크플로우를 실무에 적용하고 있습니다.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    tags: ['Claude Code', 'Cursor', 'AI Pair Programming'],
  },
  {
    id: 3,
    title: 'MSA 아키텍처',
    description: 'Kafka, Eureka, Spring Cloud Gateway를 활용한 마이크로서비스 아키텍처 설계 및 구현 경험이 있습니다.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    tags: ['Kafka', 'Eureka', 'Spring Cloud Gateway', 'OpenFeign'],
  },
  {
    id: 4,
    title: 'CI/CD & DevOps',
    description: 'Jenkins, GitHub Actions 기반 파이프라인과 Docker + Nginx Blue-Green 무중단 배포를 구현했습니다.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    tags: ['Jenkins', 'GitHub Actions', 'Docker', 'Nginx'],
  },
  {
    id: 5,
    title: '실서비스 운영',
    description: 'Commerce Cloud 기반 이커머스 플랫폼과 AWS Lightsail 기반 바디스캐너 서비스를 운영하고 있습니다.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    tags: ['Commerce Cloud', 'AWS Lightsail', 'S3', 'SSL/HTTPS'],
  },
];

export function Highlights() {
  return (
    <section id="highlights" className="py-24 px-5 bg-black text-white">
      <div className="max-w-[960px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold rounded mb-6">
            Core Strengths
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            핵심 역량
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            백엔드 개발과 인프라 구축에 집중하고 있습니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="text-gray-500 group-hover:text-white transition-colors mb-6">
                {highlight.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {highlight.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {highlight.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {highlight.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-white/10 text-gray-300 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* GitHub CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-gray-500 text-sm">프로젝트 코드 확인</p>
                <p className="text-white font-bold text-lg">GitHub Repository</p>
              </div>
            </div>
            <a
              href="https://github.com/ParkHyeonBeom"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-100 transition-all"
            >
              <span>View Profile</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

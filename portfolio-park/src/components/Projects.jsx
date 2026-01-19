const projects = [
  {
    id: 1,
    company: '(주)신영와코루',
    title: '이커머스 플랫폼 구축',
    period: '2025.10 - 2026.01',
    description:
      'Salesforce Commerce Cloud를 메인 엔진으로 도입하여 브랜드의 디지털 커머스 생태계를 구축한 프로젝트입니다.',
    tasks: [
      '프로모션 및 쿠폰 시스템 구현',
      '회원 관리 시스템 고도화',
      'React 기반 UI 개발',
      '바이럴 마케팅 엔진 개발',
      '실시간 알림톡 연동 서비스',
      'RESTful API 설계 및 연동',
    ],
    techs: ['Salesforce Commerce Cloud', 'React', 'Django', 'REST API', 'Kakao API'],
  },
  {
    id: 2,
    company: '(주)브라더인터내셔널 코리아',
    title: '통합 발주/물류 관리 플랫폼',
    period: '2025.04 - 2025.10',
    description:
      'Sales Cloud와 웹 서비스를 결합하여 본사와 총판 간의 복잡한 유통 구조를 디지털화한 통합 플랫폼입니다.',
    tasks: [
      'PO/DO 워크플로우 최적화',
      '본사 비즈니스 인텔리전스 구현',
      '통합 현황 모니터링 시스템',
      '웹 기반 바코드 리딩 시스템',
      '데이터 정합성 확보',
      '3PL 물류 시스템 통합 연동',
    ],
    techs: ['Sales Cloud', 'Experience Cloud', 'Barcode API', '3PL Integration'],
  },
  {
    id: 3,
    company: '(주)큐로셀',
    title: '안발셀용 COP 시스템',
    period: '2024.10 - 2025.04',
    description:
      '세일즈포스 플랫폼을 기반으로 환자의 세포 치료 및 관리 공정을 최적화하는 시스템입니다.',
    tasks: [
      '환자 데이터 관리 백엔드 로직 구현',
      '데이터 통신 API 설계',
      '시스템 간 인터페이스 최적화',
      '대안적 데이터 통합 솔루션 설계',
      '메일 자동화 스케줄링 시스템',
    ],
    techs: ['Lightning Platform', 'API Server', 'Email Automation', 'Data Pipeline'],
  },
  {
    id: 4,
    company: '(주)신영와코루',
    title: '바디스캐너 데이터 플랫폼',
    period: '2024.06 - 2024.10',
    description:
      '바디스캐닝 기술을 기반으로 고객의 신체 데이터를 디지털화하고 커머스와 결합한 프로젝트입니다.',
    tasks: [
      '3D 바디 스캔 데이터 시각화 모듈 개발',
      '사용자 중심 서비스 페이지 설계',
      '데이터 파싱 및 정규화',
      '구매 이력 추적 시스템 구축',
      '판매 추이 분석 대시보드 개발',
    ],
    techs: ['3D Visualization', 'OBJ/JSON', 'Data Analytics', 'Dashboard'],
  },
];

export function Projects() {
  return (
    <section id="projects" className="py-24 px-4 bg-zinc-900/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
          Projects
        </h2>
        <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
          참여한 주요 프로젝트들입니다.
        </p>

        <div className="space-y-8">
          {projects.map((project) => (
            <article
              key={project.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 hover:border-brand-500/30 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <span className="text-brand-400 text-sm font-medium">
                    {project.company}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
                    {project.title}
                  </h3>
                </div>
                <span className="text-zinc-500 text-sm whitespace-nowrap">
                  {project.period}
                </span>
              </div>

              <p className="text-zinc-400 mb-6">{project.description}</p>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-zinc-300 mb-3">
                  주요 업무
                </h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {project.tasks.map((task, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-zinc-400"
                    >
                      <span className="text-brand-400 mt-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.techs.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-medium rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

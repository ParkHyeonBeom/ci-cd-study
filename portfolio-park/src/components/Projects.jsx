const projects = [
  {
    id: 6,
    company: '한화시스템 부트캠프',
    title: 'GIGA COFFEE OMS (주문관리시스템)',
    period: '2024.03 - 2024.05',
    description:
      '한화시스템 주관 부트캠프 파이널 프로젝트. 커피 프랜차이즈 공급망 관리 효율화를 위한 주문 관리 시스템. Kubernetes 기반 무중단 배포와 모니터링 체계 구축.',
    tasks: [
      'Kubernetes 오토스케일링 및 무중단 배포',
      'Jenkins CI/CD 파이프라인 구축',
      'Prometheus + Grafana 모니터링',
      'MariaDB/Redis Master-Slave 이중화',
      'Spring Batch 유통기한 자동 관리',
    ],
    techs: ['Kubernetes', 'Jenkins', 'Docker', 'Prometheus', 'Grafana', 'Spring Batch'],
    githubUrl: 'https://github.com/beyond-sw-camp/be02-fin-Surisuri_Masuri-OMS',
    isLive: false,
    isK8s: true,
  },
  {
    id: 1,
    company: '(주)신영와코루',
    title: '이커머스 플랫폼 구축',
    period: '2025.10 - 2026.01',
    description:
      'Salesforce Commerce Cloud 기반 브랜드 커머스 플랫폼. 비너스(Venus) 브랜드 온라인 쇼핑몰 런칭.',
    tasks: [
      '프로모션 및 쿠폰 시스템 구현',
      '회원 관리 시스템 고도화',
      'React 기반 UI 개발',
      '바이럴 마케팅 엔진 개발',
      '실시간 알림톡 연동 서비스',
      'RESTful API 설계 및 연동',
    ],
    techs: ['Salesforce Commerce Cloud', 'React', 'Django', 'REST API', 'Kakao API'],
    liveUrl: 'https://www.venus-eshop.co.kr/',
    isLive: true,
  },
  {
    id: 5,
    company: '한화시스템 부트캠프',
    title: 'MSA 이커머스 플랫폼',
    period: '2024.01 - 2024.03',
    description:
      '한화시스템 주관 부트캠프에서 진행한 팀 프로젝트. 모놀리식에서 MSA로 전환한 이커머스 플랫폼으로, Kafka 기반 비동기 통신과 Spring Cloud 생태계를 활용한 마이크로서비스 아키텍처 구현.',
    tasks: [
      'Kafka 기반 비동기 메시징 (이메일 인증)',
      'Eureka 서비스 디스커버리 구현',
      'Spring Cloud Gateway 라우팅',
      'OpenFeign 동기 통신 연동',
      'Master-Slave DB Replication',
      'EC2 4대 + RDS 분산 배포',
    ],
    techs: ['Spring Boot', 'Kafka', 'Eureka', 'Gateway', 'OpenFeign', 'AWS'],
    githubUrl: 'https://github.com/beyond-sw-camp/be02-2nd-pampam-ecomerce',
    isLive: false,
    isMSA: true,
  },
  {
    id: 2,
    company: '(주)브라더인터내셔널 코리아',
    title: '통합 발주/물류 관리 플랫폼',
    period: '2025.04 - 2025.10',
    description:
      'Sales Cloud 기반 본사-총판 유통 구조 디지털화 통합 플랫폼.',
    tasks: [
      'PO/DO 워크플로우 최적화',
      '본사 비즈니스 인텔리전스 구현',
      '웹 기반 바코드 리딩 시스템',
      '3PL 물류 시스템 통합 연동',
    ],
    techs: ['Sales Cloud', 'Experience Cloud', 'Barcode API', '3PL Integration'],
    isLive: false,
  },
  {
    id: 3,
    company: '(주)큐로셀',
    title: '안발셀용 COP 시스템',
    period: '2024.10 - 2025.04',
    description:
      '환자 세포 치료 및 관리 공정 최적화 시스템. Django 기반 병원 사용자 페이지와 Salesforce Sales Cloud 기반 본사 사용자 페이지를 구현.',
    tasks: [
      'Django 기반 병원 사용자 페이지 구현',
      'Sales Cloud 기반 본사 사용자 페이지 구현',
      '환자 데이터 관리 백엔드 로직',
      '데이터 통신 API 설계',
      '메일 자동화 스케줄링',
    ],
    techs: ['Django', 'Python', 'Sales Cloud', 'Lightning Platform', 'REST API'],
    isLive: false,
  },
  {
    id: 4,
    company: '(주)신영와코루',
    title: '바디스캐너 데이터 플랫폼',
    period: '2024.06 - 2024.10',
    description:
      '3D 바디 스캔 데이터 기반 맞춤형 서비스 플랫폼.',
    tasks: [
      '3D 바디 스캔 데이터 시각화',
      '사용자 서비스 페이지 설계',
      '판매 추이 분석 대시보드',
    ],
    techs: ['3D Visualization', 'OBJ/JSON', 'Data Analytics', 'Dashboard'],
    liveUrl: 'https://scanbyme.co.kr/venus/introduction/',
    isLive: true,
  },
];

function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#3AB449] text-white text-xs font-bold rounded">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
      </span>
      LIVE
    </div>
  );
}

function MSABadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-bold rounded">
      MSA
    </div>
  );
}

function K8sBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#326CE5] text-white text-xs font-bold rounded">
      K8s
    </div>
  );
}

function ProjectCard({ project }) {
  const isLive = project.isLive;
  const isMSA = project.isMSA;
  const isK8s = project.isK8s;

  return (
    <article
      className={`relative bg-white border rounded-xl overflow-hidden transition-all duration-300 group ${
        isLive
          ? 'border-[#3AB449] shadow-lg'
          : isK8s
          ? 'border-[#326CE5] shadow-lg'
          : isMSA
          ? 'border-black shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Top Bar */}
      {isLive && <div className="absolute top-0 left-0 right-0 h-1 bg-[#3AB449]" />}
      {isK8s && <div className="absolute top-0 left-0 right-0 h-1 bg-[#326CE5]" />}
      {isMSA && !isK8s && <div className="absolute top-0 left-0 right-0 h-1 bg-black" />}

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-gray-600 text-sm font-semibold">
                {project.company}
              </span>
              {isLive && <LiveBadge />}
              {isK8s && <K8sBadge />}
              {isMSA && <MSABadge />}
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900">
              {project.title}
            </h3>
          </div>
          <span className="text-gray-500 text-sm whitespace-nowrap bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            {project.period}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6">{project.description}</p>

        {/* Tasks */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-900 mb-3">주요 업무</h4>
          <ul className="grid md:grid-cols-2 gap-2">
            {project.tasks.map((task, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {task}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {project.techs.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>

          {isLive && project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3AB449] text-white text-sm font-bold rounded hover:brightness-[0.94] transition-all"
            >
              <span>서비스 바로가기</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {(isMSA || isK8s) && project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded transition-all ${
                isK8s ? 'bg-[#326CE5] hover:bg-[#2858c7]' : 'bg-black hover:bg-gray-800'
              }`}
            >
              <span>GitHub</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  // 내림차순 정렬 (최신순)
  const sortedProjects = [...projects].sort((a, b) => {
    const getStartDate = (period) => {
      const [start] = period.split(' - ');
      const [year, month] = start.split('.');
      return parseInt(year) * 100 + parseInt(month);
    };
    return getStartDate(b.period) - getStartDate(a.period);
  });

  const liveCount = projects.filter(p => p.isLive).length;

  return (
    <section id="projects" className="py-24 px-5 bg-[#F5F5F5]">
      <div className="max-w-[960px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold rounded mb-6">
            Projects
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            프로젝트
          </h2>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#3AB449] rounded-full">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3AB449] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3AB449]"></span>
              </span>
              <span className="text-[#3AB449] font-bold text-sm">{liveCount}개 운영 중</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#326CE5] rounded-full">
              <span className="text-[#326CE5] font-bold text-sm">Kubernetes</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-full">
              <span className="text-black font-bold text-sm">MSA</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {sortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

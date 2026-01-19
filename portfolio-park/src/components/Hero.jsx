export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/20 via-transparent to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <p className="text-brand-400 text-sm font-medium mb-4 animate-fade-up">
          Salesforce & Web Based Backend Developer
        </p>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up stagger-1">
          <span className="text-white">안녕하세요,</span>
          <br />
          <span className="text-gradient">박현범</span>
          <span className="text-white">입니다</span>
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-up stagger-2">
          Salesforce 플랫폼과 웹 기반 백엔드 시스템을 전문으로 하는
          Junior 개발자입니다. KUSRC에서 다양한 엔터프라이즈 프로젝트를
          수행하고 있습니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-3">
          <a
            href="#projects"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors glow-sm hover:glow"
          >
            프로젝트 보기
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white font-medium rounded-lg transition-colors"
          >
            연락하기
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}

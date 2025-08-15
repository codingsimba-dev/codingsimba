export const BASE_SYSTEM_PROMPT = `You are an expert software engineering AI assistant that can solve any software engineering problem.

**Core Behaviors:**
- Provide accurate, practical answers with working code examples
- Explain WHY solutions work, not just HOW
- Use clear and standard markdown formatting with proper code syntax highlighting
- Break complex topics into logical sections
- Admit uncertainty rather than guess
- Include error handling and best practices in code
- Use TeX/LaTeX for mathematical expressions
- Make sure you handle accurately non-coding queries and requests

**Special Capabilities:**
- Math: \`\`\`math\`\`\` for block math, \\(\\) for inline
- Diagrams: \`\`\`mermaid\`\`\` for flowcharts and architecture
- Videos: \`\`\`youtube {videoId}\`\`\` for tutorials

Adapt explanations to user skill level and provide practical examples.`;

export const CACHED_SYSTEM_PROMPTS = {
  RAG_ASSISTANT: `You are an expert software engineering learning assistant with access to a comprehensive knowledge base. Your role is to:

1. **Provide accurate, detailed explanations** with step-by-step breakdowns for complex concepts
2. **Use the provided context** from the knowledge base to enhance your responses
3. **Cite sources** when referencing specific documentation or tutorials
4. **Adapt explanations** to the user's skill level (beginner, intermediate, advanced)
5. **Include practical examples** and code snippets when helpful
6. **Break down complex algorithms** into understandable components
7. **Provide multiple learning paths** for topics when appropriate

When answering:
- Always explain WHY something works, not just HOW
- Use analogies and metaphors for complex concepts
- Suggest related topics to explore
- Include best practices and common pitfalls
- Format code clearly with proper syntax highlighting
- Provide links to official documentation when available

Context from knowledge base will be provided in <context> tags. Use this information to enhance your responses but also draw from your general knowledge to provide comprehensive answers.`,

  SUPERCHARGED_ASSISTANT: `You are a supercharged software engineering AI assistant capable of tackling any programming challenge. You excel at:

1. **Algorithm Design & Analysis**: Breaking down complex problems, analyzing time/space complexity
2. **Visual Communication**: Create flowcharts, diagrams, and system architectures using mermaid syntax
3. **Mathematical Explanations**: Use proper math formatting for algorithms, complexity analysis, and calculations
4. **Multimedia Integration**: Embed relevant tutorial videos and interactive content
5. **Code Generation**: Writing clean, efficient code in multiple languages
6. **Interactive Diagrams**: Create interactive diagrams for better understanding
7. **Code Review & Optimization**: Identifying issues, suggesting improvements, performance optimization
8. **Architecture & Design Patterns**: System design, scalable solutions, best practices
9. **Multi-language Expertise**: Proficient in all major programming languages and frameworks
10. **Debugging & Troubleshooting**: Systematic problem-solving approaches
11. **Latest Technology Integration**: Current with modern tools, frameworks, and methodologies
12. **Career Guidance**: Technical career paths, skill development, industry insights
13. **Comprehensive Analysis**: Deep-dive explanations with microscopic detail coverage
14. **Adaptive Learning Modes**: Specialized responses based on learning context

**Core Principles:**
- **Precision & Depth**: Provide exhaustive explanations with tiny details and edge cases
- **Multiple Perspectives**: Present various approaches and their trade-offs
- **Real-world Context**: Connect concepts to industry practices and production scenarios
- **Progressive Complexity**: Start with fundamentals and build to advanced concepts
- **Actionable Intelligence**: Every response includes concrete next steps

Your responses should be:
- **Comprehensive yet focused**: Cover all aspects without overwhelming
- **Visually rich**: Use diagrams, charts, and proper formatting
- **Actionable**: Provide concrete steps and solutions
- **Educational**: Explain the reasoning behind recommendations
- **Current**: Reference latest best practices and technologies
- **Practical**: Include working examples and real-world applications

When solving problems:
1. Understand the requirements completely
2. Break down complex problems into manageable parts
3. Consider multiple solution approaches
4. Explain trade-offs and design decisions
5. Provide clean, well-documented code
6. Include testing strategies
7. Suggest improvements and scalability considerations`,

  ANALYSE_CODE: `You are a specialized code analysis expert with forensic-level attention to detail. Your analysis should be:

**Analysis Framework:**
1. **Structural Analysis**: Code organization, modularity, coupling, cohesion
2. **Quality Assessment**: Readability, maintainability, scalability, testability
3. **Performance Evaluation**: Time/space complexity, bottlenecks, optimization opportunities
4. **Security Review**: Vulnerabilities, attack vectors, security best practices
5. **Pattern Recognition**: Design patterns, anti-patterns, code smells
6. **Standards Compliance**: Language conventions, industry best practices

**Analysis Depth:**
- Line-by-line breakdown for critical sections
- Data flow analysis with visual diagrams
- Memory usage patterns and potential leaks
- Concurrency and thread safety considerations
- Error handling and edge case coverage
- Database query optimization and N+1 problems
- API design and RESTful principles adherence

**Output Format:**
- Executive summary with overall quality score
- Categorized findings with severity levels (Critical/High/Medium/Low)
- Code examples with before/after refactoring
- Performance metrics using mathematical notation
- Architecture diagrams using mermaid for complex systems
- Actionable recommendations with implementation steps
- Testing strategy suggestions
- Technical debt assessment and prioritization`,

  CREATE_TUTORIAL: `You are a master educator specializing in creating comprehensive, production-ready programming tutorials. Your tutorials should:

**Tutorial Structure:**
1. **Prerequisites & Setup**: Exact requirements, environment configuration, tooling
2. **Learning Objectives**: Specific, measurable outcomes
3. **Conceptual Foundation**: Theoretical background with real-world context
4. **Step-by-Step Implementation**: Incremental building with checkpoints
5. **Advanced Concepts**: Deep dives into nuanced aspects
6. **Practical Applications**: Multiple real-world scenarios
7. **Common Pitfalls**: Detailed troubleshooting guide
8. **Assessment & Practice**: Exercises with complete solutions

**Educational Excellence:**
- Multiple learning paths for different experience levels
- Interactive code examples with expected outputs
- Visual aids using mermaid diagrams for complex flows
- Mathematical explanations with proper notation
- Code repository structure and organization
- Testing strategies and TDD approaches
- Deployment and production considerations
- Performance optimization techniques
- Security implementation details
- Debugging methodologies

**Engagement Strategies:**
- Hands-on exercises after each major concept
- Progressive complexity with checkpoint reviews
- Real-world project integration
- Common interview questions coverage
- Industry best practices and standards
- Tool recommendations and comparisons
- Further learning resources and paths`,

  EXPLAIN_OR_DESIGN_ALGORITHM: `You are an algorithm design and analysis virtuoso. Your explanations should achieve crystal clarity through:

**Algorithm Explanation Framework:**
1. **Problem Understanding**: Precise problem definition, constraints, edge cases
2. **Intuitive Overview**: High-level approach with analogies and visualizations
3. **Detailed Walkthrough**: Step-by-step execution with example data
4. **Mathematical Analysis**: Formal complexity analysis with proofs
5. **Implementation Details**: Multiple language implementations with optimizations
6. **Variant Analysis**: Different approaches and their trade-offs
7. **Practical Applications**: Real-world usage scenarios and adaptations

**Design Process:**
- Problem decomposition and pattern recognition
- Algorithmic paradigm selection (greedy, DP, divide-and-conquer, etc.)
- Data structure selection and justification
- Pseudocode development with invariants
- Correctness proof methodology
- Complexity analysis (best, average, worst case)
- Space-time trade-off considerations
- Parallelization and optimization opportunities

**Visualization Standards:**
- Execution trace diagrams using mermaid
- State transition diagrams for complex algorithms
- Mathematical notation for formal analysis
- Code animation descriptions
- Memory layout visualizations
- Performance comparison charts
- Decision tree representations for recursive algorithms`,

  DEBUG_CODE: `You are a systematic debugging expert with surgical precision. Your debugging approach should be:

**Debugging Methodology:**
1. **Problem Identification**: Symptom analysis, error categorization, scope determination
2. **Hypothesis Formation**: Root cause theories based on evidence
3. **Systematic Investigation**: Methodical testing of hypotheses
4. **Issue Isolation**: Minimal reproducible examples
5. **Solution Development**: Multiple fix strategies with pros/cons
6. **Validation Testing**: Comprehensive test coverage for the fix
7. **Prevention Strategies**: Code patterns to avoid similar issues

**Debugging Techniques:**
- Rubber duck debugging methodology
- Binary search debugging for large codebases
- Logging and instrumentation strategies
- Debugger usage and advanced techniques
- Static analysis tool integration
- Memory profiling and leak detection
- Performance profiling and optimization
- Race condition and concurrency debugging
- Database query debugging and optimization
- API debugging and network troubleshooting

**Documentation Standards:**
- Detailed bug report analysis
- Step-by-step reproduction instructions
- Fix implementation with explanation
- Testing strategy to prevent regression
- Code review checklist for similar issues
- Monitoring and alerting recommendations
- Performance impact assessment
- Security implications of the fix`,

  CAREER_ADVICE: `You are a seasoned software engineering career mentor with deep industry insights. Your guidance should cover:

**Career Development Framework:**
1. **Skill Assessment**: Current capabilities, gaps, market demand analysis
2. **Learning Roadmap**: Structured skill development with timelines
3. **Industry Insights**: Market trends, emerging technologies, company cultures
4. **Career Pathways**: Technical tracks, management transitions, specializations
5. **Professional Growth**: Networking, mentorship, conference participation
6. **Portfolio Development**: Project selection, GitHub optimization, personal branding
7. **Interview Preparation**: Technical skills, system design, behavioral questions

**Specialization Tracks:**
- Frontend/Backend/Full-stack development paths
- DevOps and Site Reliability Engineering
- Data Engineering and Machine Learning
- Mobile development (iOS/Android/Cross-platform)
- Systems programming and embedded development
- Security engineering and ethical hacking
- Technical writing and developer advocacy
- Engineering management and technical leadership

**Practical Guidance:**
- Resume optimization for ATS and recruiters
- Salary negotiation strategies and market data
- Remote work best practices and tools
- Open source contribution strategies
- Side project development and monetization
- Technical blog writing and content creation
- Conference speaking and community involvement
- Startup vs. enterprise career considerations`,

  SYSTEM_DESIGN: `You are a system architecture expert with experience designing scalable, fault-tolerant systems. Your system design approach should include:

**Design Process:**
1. **Requirements Gathering**: Functional and non-functional requirements
2. **Capacity Planning**: Scale estimation, traffic patterns, data growth
3. **High-Level Architecture**: Component identification and interactions
4. **Detailed Design**: Service APIs, data models, communication protocols
5. **Scalability Strategy**: Horizontal scaling, load balancing, caching
6. **Reliability Engineering**: Fault tolerance, disaster recovery, monitoring
7. **Security Architecture**: Authentication, authorization, data protection

**System Components:**
- Load balancers and reverse proxies
- Microservices vs. monolith trade-offs
- Database selection (SQL/NoSQL/NewSQL)
- Caching strategies (Redis, Memcached, CDN)
- Message queues and event streaming
- API gateway and service mesh
- Monitoring and observability stack
- CI/CD pipeline architecture

**Advanced Considerations:**
- CAP theorem implications
- Eventual consistency patterns
- Circuit breaker and bulkhead patterns
- Data partitioning and sharding strategies
- Cross-region replication and disaster recovery
- Performance optimization and bottleneck analysis
- Cost optimization and resource allocation
- Compliance and regulatory requirements

**Documentation Standards:**
- Architecture decision records (ADRs)
- System diagrams using mermaid
- API specifications and contracts
- Runbook and operational procedures
- Performance benchmarks and SLAs
- Security threat modeling
- Disaster recovery procedures`,

  ANALYZE_ALGORITHM: `You are an algorithm analysis expert with mathematical rigor and practical insight. Your analysis should provide:

**Comprehensive Analysis Framework:**
1. **Algorithmic Paradigm**: Classification and pattern identification
2. **Correctness Proof**: Formal verification of algorithm properties
3. **Complexity Analysis**: Time, space, and auxiliary complexity bounds
4. **Optimality Assessment**: Lower bounds and optimal solution comparison
5. **Practical Performance**: Real-world benchmarks and profiling
6. **Variant Comparison**: Alternative approaches and trade-offs
7. **Implementation Considerations**: Language-specific optimizations

**Mathematical Rigor:**
- Asymptotic notation (Big O, Theta, Omega) with formal definitions
- Recurrence relation solving techniques
- Amortized analysis for data structures
- Probabilistic analysis for randomized algorithms
- Master theorem applications
- Mathematical induction proofs
- Invariant and precondition analysis

**Performance Evaluation:**
- Best, average, and worst-case analysis
- Input distribution sensitivity
- Cache performance and memory hierarchy impact
- Parallelization potential and scalability
- Numerical stability for mathematical algorithms
- Approximation ratio for heuristic algorithms
- Competitive analysis for online algorithms

**Visual Analysis:**
- Execution flow diagrams
- Complexity growth charts
- Decision tree analysis
- State space exploration
- Performance comparison graphs
- Memory access patterns
- Algorithm animation descriptions`,

  CODE_REVIEW: `You are a senior code reviewer with expertise across multiple domains and languages. Your code review should be:

**Review Standards:**
1. **Functionality**: Logic correctness, requirement fulfillment, edge case handling
2. **Code Quality**: Readability, maintainability, modularity, testability
3. **Performance**: Efficiency, scalability, resource utilization
4. **Security**: Vulnerability assessment, secure coding practices
5. **Standards Compliance**: Style guides, conventions, best practices
6. **Architecture**: Design patterns, SOLID principles, separation of concerns
7. **Testing**: Test coverage, test quality, testing strategies

**Review Categories:**
- **Critical Issues**: Security vulnerabilities, data loss risks, performance bottlenecks
- **Major Issues**: Logic errors, design flaws, maintainability problems
- **Minor Issues**: Style violations, naming improvements, minor optimizations
- **Suggestions**: Alternative approaches, performance improvements, refactoring opportunities

**Feedback Framework:**
- Specific line-by-line comments with explanations
- Code examples showing improved implementations
- Links to documentation and best practice guides
- Severity classification with justification
- Positive feedback highlighting good practices
- Learning opportunities and knowledge sharing
- Actionable recommendations with clear steps

**Quality Gates:**
- Automated testing requirements
- Code coverage thresholds
- Performance benchmark compliance
- Security scan results
- Documentation completeness
- API contract adherence
- Deployment readiness checklist`,
};

// Type definitions for learning modes
export type LearningMode =
  | "analyse-code"
  | "create-tutorial"
  | "explain-or-design-algorithm"
  | "debug-code"
  | "career-advice"
  | "system-design"
  | "analyze-algorithm"
  | "code-review"
  | "default";

// Mapping object for easy access
export const LEARNING_MODE_PROMPTS: Record<LearningMode, string> = {
  "analyse-code": CACHED_SYSTEM_PROMPTS.ANALYSE_CODE,
  "create-tutorial": CACHED_SYSTEM_PROMPTS.CREATE_TUTORIAL,
  "explain-or-design-algorithm":
    CACHED_SYSTEM_PROMPTS.EXPLAIN_OR_DESIGN_ALGORITHM,
  "debug-code": CACHED_SYSTEM_PROMPTS.DEBUG_CODE,
  "career-advice": CACHED_SYSTEM_PROMPTS.CAREER_ADVICE,
  "system-design": CACHED_SYSTEM_PROMPTS.SYSTEM_DESIGN,
  "analyze-algorithm": CACHED_SYSTEM_PROMPTS.ANALYZE_ALGORITHM,
  "code-review": CACHED_SYSTEM_PROMPTS.CODE_REVIEW,
  default: CACHED_SYSTEM_PROMPTS.SUPERCHARGED_ASSISTANT,
};

export const SOFTWARE_ENG_DOMAINS = [
  // Documentation & Official Sites
  "stackoverflow.com",
  "github.com",
  "gitlab.com",
  "bitbucket.org",
  "developer.mozilla.org",
  "docs.python.org",
  "reactjs.org",
  "nodejs.org",
  "vuejs.org",
  "angular.io",
  "svelte.dev",
  "nextjs.org",
  "nuxtjs.org",
  "django.readthedocs.io",
  "flask.palletsprojects.com",
  "fastapi.tiangolo.com",
  "spring.io",
  "laravel.com",
  "rubyonrails.org",
  "expressjs.com",
  "nestjs.com",
  "kubernetes.io",
  "docker.com",
  "terraform.io",
  "ansible.com",
  "jenkins.io",
  "nginx.org",
  "apache.org",
  "redis.io",
  "mongodb.com",
  "postgresql.org",
  "mysql.com",
  "sqlite.org",
  "elasticsearch.co",
  "tensorflow.org",
  "pytorch.org",
  "scikit-learn.org",
  "pandas.pydata.org",
  "numpy.org",
  "jupyter.org",

  // Cloud Providers & Services
  "fly.io",
  "aws.amazon.com",
  "cloud.google.com",
  "azure.microsoft.com",
  "digitalocean.com",
  "heroku.com",
  "netlify.com",
  "vercel.com",
  "firebase.google.com",
  "supabase.com",
  "cloudflare.com",
  "linode.com",
  "vultr.com",

  // Learning Platforms & Tutorials
  "medium.com",
  "dev.to",
  "hackernoon.com",
  "freecodecamp.org",
  "geeksforgeeks.org",
  "leetcode.com",
  "hackerrank.com",
  "codewars.com",
  "educative.io",
  "coursera.org",
  "udemy.com",
  "pluralsight.com",
  "edx.org",
  "codecademy.com",
  "khanacademy.org",
  "roadmap.sh",
  "javascript.info",
  "w3schools.com",
  "tutorialspoint.com",
  "javatpoint.com",
  "programiz.com",
  "codepen.io",
  "jsfiddle.net",
  "repl.it",
  "codesandbox.io",

  // Community & News
  "reddit.com",
  "news.ycombinator.com",
  "producthunt.com",
  "indie.hackers.com",
  "lobste.rs",
  "techcrunch.com",
  "thenewstack.io",
  "infoq.com",
  "smashingmagazine.com",
  "css-tricks.com",
  "alistapart.com",

  // Tools & Resources
  "npmjs.com",
  "pypi.org",
  "packagist.org",
  "rubygems.org",
  "nuget.org",
  "crates.io",
  "maven.apache.org",
  "gradle.org",
  "webpack.js.org",
  "vitejs.dev",
  "rollupjs.org",
  "babeljs.io",
  "eslint.org",
  "prettier.io",
  "jestjs.io",
  "mochajs.org",
  "cypress.io",
  "selenium.dev",
  "postman.com",
  "insomnia.rest",
  "figma.com",
  "sketch.com",
  "invisionapp.com",
  "notion.so",
  "confluence.atlassian.com",
  "jira.atlassian.com",
  "trello.com",
  "asana.com",
  "slack.com",
  "discord.com",
  "teams.microsoft.com",
  "zoom.us",
  "tekbreed.com",
];

export const TECHNICAL_TERMS = [
  // Programming Languages
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "c#",
  "php",
  "ruby",
  "go",
  "rust",
  "kotlin",
  "swift",
  "dart",
  "scala",
  "clojure",
  "elixir",
  "r",
  "matlab",
  "sql",
  "html",
  "css",
  "sass",
  "less",
  "stylus",

  // Frontend Frameworks & Libraries
  "react",
  "vue",
  "angular",
  "svelte",
  "ember",
  "backbone",
  "jquery",
  "bootstrap",
  "tailwind",
  "material-ui",
  "ant design",
  "chakra ui",
  "styled-components",
  "emotion",

  // Backend Frameworks
  "node",
  "express",
  "nestjs",
  "koa",
  "fastify",
  "django",
  "flask",
  "fastapi",
  "spring",
  "laravel",
  "symfony",
  "codeigniter",
  "rails",
  "sinatra",
  "gin",
  "echo",
  "fiber",

  // Mobile Development
  "react native",
  "flutter",
  "xamarin",
  "ionic",
  "cordova",
  "phonegap",
  "native script",
  "android",
  "ios",
  "kotlin multiplatform",

  // Databases
  "database",
  "sql",
  "nosql",
  "mongodb",
  "postgresql",
  "mysql",
  "sqlite",
  "redis",
  "elasticsearch",
  "cassandra",
  "dynamodb",
  "firestore",
  "couchdb",
  "neo4j",
  "influxdb",
  "clickhouse",

  // Architecture & Patterns
  "api",
  "rest",
  "graphql",
  "grpc",
  "soap",
  "microservices",
  "monolith",
  "serverless",
  "mvc",
  "mvvm",
  "mvp",
  "clean architecture",
  "hexagonal architecture",
  "onion architecture",
  "domain driven design",
  "event sourcing",
  "cqrs",
  "saga pattern",
  "observer pattern",
  "singleton pattern",
  "factory pattern",
  "strategy pattern",
  "decorator pattern",
  "adapter pattern",
  "facade pattern",

  // Cloud & Infrastructure
  "cloud computing",
  "aws",
  "azure",
  "gcp",
  "containerization",
  "docker",
  "kubernetes",
  "helm",
  "terraform",
  "ansible",
  "puppet",
  "chef",
  "vagrant",
  "nginx",
  "apache",
  "load balancer",
  "cdn",
  "edge computing",
  "lambda",
  "azure functions",
  "cloud functions",

  // DevOps & CI/CD
  "devops",
  "ci/cd",
  "continuous integration",
  "continuous deployment",
  "continuous delivery",
  "jenkins",
  "github actions",
  "gitlab ci",
  "travis ci",
  "circle ci",
  "azure devops",
  "bamboo",
  "teamcity",
  "docker compose",
  "docker swarm",
  "monitoring",
  "logging",
  "prometheus",
  "grafana",
  "elk stack",
  "splunk",
  "datadog",
  "new relic",

  // Testing
  "testing",
  "unit testing",
  "integration testing",
  "e2e testing",
  "end-to-end testing",
  "acceptance testing",
  "regression testing",
  "performance testing",
  "load testing",
  "stress testing",
  "security testing",
  "test driven development",
  "tdd",
  "behavior driven development",
  "bdd",
  "test coverage",
  "code coverage",
  "mocking",
  "stubbing",
  "jest",
  "mocha",
  "jasmine",
  "karma",
  "cypress",
  "selenium",
  "playwright",
  "puppeteer",
  "testing library",

  // Version Control & Collaboration
  "version control",
  "git",
  "github",
  "gitlab",
  "bitbucket",
  "svn",
  "mercurial",
  "branching",
  "merging",
  "pull request",
  "merge request",
  "code review",
  "pair programming",
  "mob programming",

  // Methodologies & Practices
  "agile",
  "scrum",
  "kanban",
  "lean",
  "waterfall",
  "extreme programming",
  "xp",
  "sprint",
  "retrospective",
  "daily standup",
  "user story",
  "epic",
  "backlog",
  "velocity",
  "burndown chart",
  "technical debt",
  "refactoring",
  "code smell",
  "clean code",
  "solid principles",
  "dry principle",
  "kiss principle",
  "yagni principle",

  // Security
  "security",
  "cybersecurity",
  "authentication",
  "authorization",
  "oauth",
  "jwt",
  "ssl",
  "tls",
  "https",
  "encryption",
  "hashing",
  "bcrypt",
  "cors",
  "csrf",
  "xss",
  "sql injection",
  "clickjacking",
  "session hijacking",
  "man-in-the-middle",
  "ddos",
  "firewall",
  "vpn",
  "penetration testing",
  "vulnerability assessment",

  // Data & Analytics
  "data science",
  "big data",
  "data engineering",
  "data warehouse",
  "data lake",
  "etl",
  "elt",
  "data pipeline",
  "business intelligence",
  "analytics",
  "machine learning",
  "artificial intelligence",
  "deep learning",
  "neural network",
  "natural language processing",
  "nlp",
  "computer vision",
  "tensorflow",
  "pytorch",
  "scikit-learn",
  "pandas",
  "numpy",
  "matplotlib",
  "seaborn",
  "jupyter",
  "apache spark",
  "hadoop",
  "kafka",
  "airflow",

  // Web Technologies
  "web development",
  "frontend",
  "backend",
  "full stack",
  "responsive design",
  "mobile first",
  "progressive web app",
  "pwa",
  "single page application",
  "spa",
  "server side rendering",
  "ssr",
  "static site generation",
  "ssg",
  "jamstack",
  "headless cms",
  "web components",
  "shadow dom",
  "virtual dom",
  "service worker",
  "web workers",
  "websocket",
  "webrtc",
  "webassembly",
  "wasm",

  // Performance & Optimization
  "performance",
  "optimization",
  "caching",
  "memoization",
  "lazy loading",
  "code splitting",
  "tree shaking",
  "minification",
  "compression",
  "bundling",
  "webpack",
  "rollup",
  "parcel",
  "vite",
  "esbuild",
  "babel",
  "polyfill",
  "transpilation",

  // Quality Assurance
  "quality assurance",
  "qa",
  "code quality",
  "static analysis",
  "linting",
  "eslint",
  "tslint",
  "prettier",
  "sonarqube",
  "code metrics",
  "cyclomatic complexity",
  "maintainability index",
  "technical debt ratio",

  // Emerging Technologies
  "blockchain",
  "web3",
  "smart contracts",
  "cryptocurrency",
  "nft",
  "defi",
  "dao",
  "ethereum",
  "solidity",
  "ipfs",
  "iot",
  "edge ai",
  "quantum computing",
  "ar",
  "vr",
  "augmented reality",
  "virtual reality",
  "mixed reality",

  // Data Formats & Protocols
  "json",
  "xml",
  "yaml",
  "csv",
  "protobuf",
  "avro",
  "parquet",
  "http",
  "https",
  "ftp",
  "smtp",
  "imap",
  "pop3",
  "tcp",
  "udp",
  "websocket",
  "mqtt",
  "amqp",

  // Development Tools
  "ide",
  "text editor",
  "vscode",
  "intellij",
  "eclipse",
  "vim",
  "emacs",
  "sublime text",
  "atom",
  "notepad++",
  "debugging",
  "profiling",
  "build tools",
  "task runner",
  "package manager",
  "npm",
  "yarn",
  "pip",
  "composer",
  "maven",
  "gradle",
  "make",
  "cmake",

  // General Computing Concepts
  "algorithm",
  "data structure",
  "array",
  "linked list",
  "stack",
  "queue",
  "tree",
  "graph",
  "hash table",
  "heap",
  "sorting",
  "searching",
  "recursion",
  "iteration",
  "big o notation",
  "time complexity",
  "space complexity",
  "concurrency",
  "parallelism",
  "multithreading",
  "async",
  "synchronous",
  "asynchronous",
  "callback",
  "promise",
  "async/await",
  "event loop",
  "memory management",
  "garbage collection",
  "compilation",
  "interpretation",
  "runtime",
  "virtual machine",

  // Documentation & Communication
  "documentation",
  "api documentation",
  "readme",
  "changelog",
  "technical writing",
  "code comments",
  "inline documentation",
  "swagger",
  "openapi",
  "postman",
  "insomnia",
  "markdown",
  "jsdoc",
  "sphinx",
  "gitbook",
  "confluence",
  "notion",

  // Project Management & Organization
  "project management",
  "requirements gathering",
  "user requirements",
  "functional requirements",
  "non-functional requirements",
  "use case",
  "user story",
  "acceptance criteria",
  "mockup",
  "wireframe",
  "prototype",
  "mvp",
  "minimum viable product",
  "poc",
  "proof of concept",
  "stakeholder",
  "product owner",
  "scrum master",
  "team lead",
  "tech lead",
  "architect",
  "code",
  "coding",
  "programming",
  "development",
  "software",
  "application",
  "system",
  "platform",
  "framework",
  "library",
  "module",
  "component",
  "service",
  "function",
  "method",
  "class",
  "object",
  "interface",
  "abstract",
  "inheritance",
  "polymorphism",
  "encapsulation",
  "abstraction",
  "composition",
  "aggregation",
  "dependency injection",
  "inversion of control",
  "tutorial",
  "guide",
  "example",
  "sample",
  "demo",
  "workshop",
  "bootcamp",
  "course",
  "certification",
  "training",
  "learning",
  "education",
  "skill",
  "knowledge",
  "experience",
  "expertise",
  "best practices",
  "coding standards",
  "style guide",
  "convention",
  "pattern",
  "anti-pattern",
  "code review",
  "peer review",
  "mentoring",
  "coaching",
  "pair programming",
  "mob programming",
  "remote work",
  "distributed team",
  "collaboration",
  "communication",
  "feedback",
  "retrospective",
  "post-mortem",
  "incident response",
  "troubleshooting",
  "debugging",
  "error handling",
  "exception handling",
  "logging",
  "monitoring",
  "alerting",
  "metrics",
  "analytics",
  "reporting",
  "dashboard",
  "visualization",
  "chart",
  "graph",
  "diagram",
  "flowchart",
  "sequence diagram",
  "architecture diagram",
  "system design",
  "scalability",
  "reliability",
  "availability",
  "fault tolerance",
  "disaster recovery",
  "backup",
  "restore",
  "migration",
  "upgrade",
  "deployment",
  "release",
  "rollback",
  "blue-green deployment",
  "canary deployment",
  "feature flag",
  "a/b testing",
  "experimentation",
  "hypothesis",
  "validation",
  "feedback loop",
  "iteration",
  "continuous improvement",
  "kaizen",
  "lean startup",
  "fail fast",
  "pivot",
  "innovation",
  "creativity",
  "problem solving",
  "critical thinking",
  "analytical thinking",
  "systems thinking",
  "design thinking",
  "user experience",
  "ux",
  "user interface",
  "ui",
  "usability",
  "accessibility",
  "inclusive design",
  "universal design",
  "responsive design",
  "adaptive design",
  "mobile first",
  "progressive enhancement",
  "graceful degradation",
];

export const SOFTWARE_CATEGORIES = {
  PROGRAMMING_LANGUAGES: [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "Kotlin",
    "Swift",
    "Dart",
    "Scala",
  ],

  FRONTEND_TECHNOLOGIES: [
    "React",
    "React Router",
    "Remix",
    "Next.js",
    "Vue.js",
    "Angular",
    "Svelte",
    "HTML5",
    "CSS3",
    "Sass",
    "Tailwind CSS",
    "Bootstrap",
    "Webpack",
    "Vite",
  ],

  BACKEND_TECHNOLOGIES: [
    "Node.js",
    "Hono.js",
    "Express.js",
    "Fastify",
    "Nest.js",
    "Django",
    "Flask",
    "FastAPI",
    "Spring Boot",
    "Laravel",
    "Ruby on Rails",
    "ASP.NET",
    "Gin",
    "Echo",
  ],

  DATABASES: [
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "Elasticsearch",
    "DynamoDB",
    "Cassandra",
    "SQLite",
    "Neo4j",
    "InfluxDB",
  ],

  CLOUD_PLATFORMS: [
    "AWS",
    "Google Cloud Platform",
    "Microsoft Azure",
    "Digital Ocean",
    "Heroku",
    "Vercel",
    "Netlify",
    "Firebase",
    "Supabase",
  ],

  DEVOPS_TOOLS: [
    "Docker",
    "Kubernetes",
    "Jenkins",
    "GitHub Actions",
    "Terraform",
    "Ansible",
    "Prometheus",
    "Grafana",
    "ELK Stack",
    "Nginx",
  ],

  TESTING_FRAMEWORKS: [
    "Jest",
    "Mocha",
    "Cypress",
    "Selenium",
    "Playwright",
    "JUnit",
    "PyTest",
    "RSpec",
    "TestNG",
    "Karma",
  ],

  MOBILE_DEVELOPMENT: [
    "React Native",
    "Flutter",
    "Xamarin",
    "Ionic",
    "Android Native",
    "iOS Native",
    "Cordova",
    "NativeScript",
  ],

  DATA_TECHNOLOGIES: [
    "Apache Spark",
    "Apache Kafka",
    "Apache Airflow",
    "TensorFlow",
    "PyTorch",
    "Pandas",
    "NumPy",
    "Jupyter",
    "Hadoop",
  ],

  METHODOLOGIES: [
    "Agile",
    "Scrum",
    "Kanban",
    "DevOps",
    "Test-Driven Development",
    "Behavior-Driven Development",
    "Continuous Integration",
    "Continuous Deployment",
    "Domain-Driven Design",
  ],
};

export const DEBUG_KEYWORDS = [
  "debug",
  "fix",
  "error",
  "bug",
  "not working",
  "broken",
  "issue",
  "problem",
  "troubleshoot",
  "why doesn't",
  "what's wrong",
  "crash",
  "exception",
  "stack trace",
  "logs",
  "debugging",
  "syntax error",
  "runtime error",
  "fix this code",
  "why is this failing",
  "help me solve",
];

export const REVIEW_KEYWORDS = [
  "review",
  "improve",
  "optimize",
  "refactor",
  "clean up",
  "best practices",
  "code quality",
  "performance",
  "maintainable",
  "readable",
  "lint",
  "static analysis",
  "technical debt",
  "peer review",
  "feedback on code",
  "how to make this better",
  "coding standards",
];

export const TUTORIAL_KEYWORDS = [
  "tutorial",
  "learn",
  "teach",
  "explain",
  "how to",
  "guide",
  "step by step",
  "beginner",
  "introduction",
  "getting started",
  "walkthrough",
  "example",
  "demo",
  "hands-on",
  "crash course",
  "for dummies",
  "basics",
  "primer",
];

export const ALGORITHM_KEYWORDS = [
  "algorithm",
  "complexity",
  "big o",
  "time complexity",
  "space complexity",
  "sorting",
  "searching",
  "optimization",
  "dynamic programming",
  "recursion",
  "graph",
  "tree",
  "Dijkstra",
  "BFS",
  "DFS",
  "backtracking",
  "greedy",
  "divide and conquer",
  "memoization",
  "hash table",
  "binary search",
];

export const SYSTEM_DESIGN_KEYWORDS = [
  "system design",
  "architecture",
  "scalable",
  "distributed",
  "microservices",
  "load balancer",
  "database design",
  "caching",
  "api design",
  "infrastructure",
  "high availability",
  "fault tolerance",
  "CAP theorem",
  "event-driven",
  "message queue",
  "Kafka",
  "Kubernetes",
  "cloud design",
  "serverless",
];

export const ANALYSIS_KEYWORDS = [
  "analyze",
  "analysis",
  "understand",
  "explain code",
  "what does this do",
  "breakdown",
  "structure",
  "patterns",
  "code walkthrough",
  "interpret",
  "reverse engineer",
  "how this works",
  "flow",
  "control flow",
];

export const COMPLEXITY_INDICATORS = [
  "enterprise",
  "production",
  "scalable",
  "distributed",
  "microservices",
  "advanced",
  "complex",
  "detailed",
  "comprehensive",
  "in-depth",
  "performance optimization",
  "security",
  "architecture",
  "design patterns",
  "multithreading",
  "concurrency",
  "async",
  "parallel",
  "low latency",
  "high throughput",
];

export const SIMPLICITY_INDICATORS = [
  "simple",
  "basic",
  "quick",
  "beginner",
  "easy",
  "what is",
  "how do i",
  "briefly",
  "overview",
  "introduction",
  "starter",
  "minimal",
  "boilerplate",
];

export const SOFTWARE_INDICATORS = [
  "code",
  "programming",
  "development",
  "framework",
  "library",
  "api",
  "documentation",
  "tutorial",
  "github",
  "npm",
  "package",
  "algorithm",
  "data structure",
  "design pattern",
  "architecture",
  "SDK",
  "CLI",
  "IDE",
  "debugger",
  "container",
  "Docker",
  "Kubernetes",
];

export const CAREER_KEYWORDS = [
  // General career terms
  "career",
  "job",
  "interview",
  "resume",
  "salary",
  "promotion",
  "skills",
  "learning path",
  "certifications",
  "industry",
  "role",
  "position",
  "hiring",

  // Tactical/short-term career queries
  "negotiation",
  "job search",
  "quick advice",
  "should I",
  "how to",
  "what technology",
  "which framework",
  "offer letter",
  "LinkedIn",
  "portfolio",
  "cover letter",
  "technical interview",
  "whiteboard",

  // Complex/long-term career strategy
  "career transition",
  "long-term strategy",
  "leadership",
  "startup",
  "entrepreneurship",
  "industry trends",
  "comprehensive plan",
  "roadmap",
  "architecture career",
  "principal engineer",
  "technical director",
  "CTO",
  "management",
  "tech lead",
  "mentorship",
  "career growth",
  "promotion path",
  "career pivot",
  "freelancing",
  "remote work",
  "compensation strategy",
];

export const QUESTION_INDICATORS = [
  // Time-sensitive queries (news/updates)
  "what is the latest",
  "what's new in",
  "any recent updates on",
  "latest trends in",
  "has there been any news about",

  // Popularity/trending queries
  "how popular is",
  "is anyone still using",
  "what’s trending in",
  "is X dying",
  "is X outdated",

  // Decision-making queries (should I use X?)
  "is it worth",
  "should I use",
  "should I learn",
  "is X better than Y",
  "is X good for",
  "would you recommend",
  "pros and cons of",
  "advantages of",

  // Opinion-based queries
  "what do people think",
  "what’s the consensus on",
  "do developers like",
  "why do people hate",
  "why is X so popular",

  // Real-world/experience-based queries
  "real world",
  "production",
  "in practice",
  "industry standard",
  "enterprise use",
  "scaling X",
  "war stories about",
  "case study on",
];

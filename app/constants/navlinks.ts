import { FileText, Play, GraduationCap, Target, Trophy } from "lucide-react";

export const slogan = "Breeding the next generation of software developers";

export const learningIcons = {
  articles: FileText,
  tutorials: Play,
  courses: GraduationCap,
  programs: Target,
  challenges: Trophy,
};

export const learning = [
  { name: "articles", path: "articles", icon: learningIcons.articles },
  { name: "tutorials", path: "tutorials", icon: learningIcons.tutorials },
  { name: "courses", path: "courses", icon: learningIcons.courses },
  { name: "programs", path: "programs", icon: learningIcons.programs },
  { name: "challenges", path: "challenges", icon: learningIcons.challenges },
];

export const content = [
  { name: "support", path: "support" },
  { name: "chat", path: "chat" },
  { name: "job board", path: "job-board" },
  { name: "store", path: "store" },
  { name: "roadmap", path: "roadmap" },
];

export const platform = [
  { name: "about", path: "about" },
  { name: "contact", path: "contact" },
  { name: "FAQs", path: "support#faqs" },
];

export const legal = [
  { name: "terms", path: "terms" },
  { name: "privacy", path: "privacy" },
];

export const social = [
  { name: "X (formerly twitter)", path: "https://x.com/tekbreed" },
  {
    name: "LinkedIn",
    path: "https://www.linkedin.com/in/christopher-sesugh-265332176/",
  },
  { name: "Github", path: "https://github.com/tekbreed" },
  { name: "YouTube", path: "https://www.youtube.com/@tekbreed" },
];

export const navLinks = [
  ...content,
  ...platform.filter((link) => link.path !== "#faqs"),
].filter((item) => !item.path.includes("contact"));

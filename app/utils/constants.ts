import { FileText, Play, GraduationCap, Target, Trophy } from "lucide-react";

export const slogan = "Breeding the next generation of software developers";
export const domain = "tekbreed.com";
export const nameInputPlaceholder = "Tony Max";

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
  { name: "chat", path: "chat" },
  { name: "job board", path: "job-board" },
  { name: "store", path: "store" },
  { name: "support", path: "support" },
  { name: "changelog", path: "changelog" },
];

export const platform = [
  { name: "about", path: "about" },
  { name: "contact", path: "contact" },
  { name: "FAQs", path: "support#faqs" },
  { name: "color scheme", path: "color-scheme" },
];

export const legal = [
  { name: "terms", path: "legal/terms-of-use" },
  { name: "privacy", path: "legal/privacy-policy" },
];

export const social = [
  { name: "X", path: "https://x.com/tekbreed" },
  {
    name: "LinkedIn",
    path: "https://www.linkedin.com/in/christopher-sesugh-265332176/",
  },
  { name: "YouTube", path: "https://www.youtube.com/@tekbreed" },
  { name: "Discord", path: "https://discord.gg/7uZ6PWf4Xv" },
  { name: "Github", path: "https://github.com/tekbreed" },
];

export const navLinks = [
  ...content,
  ...platform.filter((link) => link.path !== "#faqs"),
].filter((item) => !item.path.includes("contact"));

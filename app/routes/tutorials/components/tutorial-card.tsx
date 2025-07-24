// import { Crown } from "lucide-react";
// import { Card, CardContent } from "~/components/ui/card";
// import { Badge } from "~/components/ui/badge";
// import type { Tutorial } from "~/utils/content.server/turorials/types";
// import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
// import { cn, getInitials } from "~/utils/misc";

// interface TutorialCardProps {
//   tutorial: Tutorial;
// }

// export function TutorialCard({ tutorial }: TutorialCardProps) {
//   return (
//     <Card className="group relative h-full overflow-hidden rounded-xl border-0 bg-gradient-to-br from-white to-gray-50 pt-0 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:from-gray-900 dark:to-gray-800">
//       <div className="relative aspect-video overflow-hidden">
//         <img
//           src={tutorial.image ?? ""}
//           alt={tutorial.title}
//           className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
//           loading="lazy"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

//         <div className="absolute bottom-3 right-3">
//           <Badge
//             variant={tutorial.premium ? "default" : "secondary"}
//             className={cn(
//               "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium backdrop-blur-sm",
//               tutorial.premium
//                 ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
//                 : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg",
//             )}
//           >
//             {tutorial.premium ? <Crown className="h-3 w-3" /> : null}
//             {tutorial.premium ? "Premium" : "Free"}
//           </Badge>
//         </div>

//         <div className="absolute bottom-3 left-3 flex items-center rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-800 backdrop-blur-sm dark:bg-gray-900/90 dark:text-gray-200">
//           <span>{tutorial.lessonsCount} lessons</span>
//         </div>
//       </div>

//       <CardContent className="flex h-32 flex-col justify-between p-6 text-center">
//         <h3 className="text-xl font-bold leading-tight text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
//           {tutorial.title}
//         </h3>

//         <div className="mt-4 flex items-center justify-center">
//           <Avatar className="size-8">
//             <AvatarImage src={tutorial.author.image} loading="lazy" />
//             <AvatarFallback>{getInitials(tutorial.author.name)}</AvatarFallback>
//           </Avatar>
//           <div className="ml-3 text-left">
//             <p className="line-clamp-1 text-sm font-medium text-gray-700 dark:text-gray-300">
//               {tutorial.author.name}
//             </p>
//             <p className="text-xs text-gray-500 dark:text-gray-400">Author</p>
//           </div>
//         </div>
//       </CardContent>
//       <div className="absolute inset-0 rounded-xl border-2 border-transparent transition-colors duration-300 group-hover:border-blue-500/20" />
//     </Card>
//   );
// }

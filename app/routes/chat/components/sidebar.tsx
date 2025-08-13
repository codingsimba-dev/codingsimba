// import { Ellipsis, History, MessageSquare, Plus, Trash2 } from "lucide-react";
// import { Header } from "~/components/page-header";
// import { Button } from "~/components/ui/button";
// import { ScrollArea } from "~/components/ui/scroll-area";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "~/components/ui/sidebar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "~/components/ui/popover";
// import type { Conversation } from "..";

// export function ChatSidebar({
//   conversations,
//   activeConversationId,
//   onConversationSelect,
//   onNewConversation,
//   onDeleteConversation,
// }: {
//   conversations: Conversation[];
//   activeConversationId: string;
//   onConversationSelect: (id: string) => void;
//   onNewConversation: () => void;
//   onDeleteConversation: (id: string) => void;
// }) {
//   function groupConversationsByDate(conversations: Conversation[]) {
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
//     const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

//     const groups = {
//       today: [] as Conversation[],
//       yesterday: [] as Conversation[],
//       lastWeek: [] as Conversation[],
//       older: [] as Conversation[],
//     };

//     conversations.forEach((conv) => {
//       const convDate = new Date(conv.timestamp);
//       if (convDate >= today) {
//         groups.today.push(conv);
//       } else if (convDate >= yesterday) {
//         groups.yesterday.push(conv);
//       } else if (convDate >= lastWeek) {
//         groups.lastWeek.push(conv);
//       } else {
//         groups.older.push(conv);
//       }
//     });

//     return groups;
//   }
//   const groupedConversations = groupConversationsByDate(conversations);

//   return (
//     <Sidebar className="border-r">
//       <Header title="Katak" className="[&>h1]:text-md p-2 [&>p]:text-sm" />
//       <SidebarHeader className="border-b p-4">
//         <Button
//           onClick={onNewConversation}
//           className="w-full justify-start gap-2"
//           variant="outline"
//         >
//           <Plus className="h-4 w-4" />
//           New conversation
//         </Button>
//       </SidebarHeader>

//       <SidebarContent>
//         <ScrollArea className="flex-1">
//           {/* Today */}
//           {groupedConversations.today.length > 0 && (
//             <SidebarGroup>
//               <SidebarGroupLabel>Today</SidebarGroupLabel>
//               <SidebarGroupContent>
//                 <SidebarMenu className="flex flex-col justify-center gap-2">
//                   {groupedConversations.today.map((conversation) => (
//                     <SidebarMenuItem key={conversation.id}>
//                       <SidebarMenuButton
//                         onClick={() => onConversationSelect(conversation.id)}
//                         isActive={activeConversationId === conversation.id}
//                         size={"sm"}
//                         className="group relative flex w-full items-center justify-start border"
//                       >
//                         <MessageSquare className="size-4" />
//                         <div className="flex-1 text-left">
//                           <div className="truncate font-medium">
//                             {conversation.title.substring(0, 22)}
//                             {conversation.title.length > 22 ? "..." : ""}
//                           </div>
//                         </div>
//                         <Popover>
//                           <PopoverTrigger
//                             onClick={(e) => {
//                               e.stopPropagation();
//                             }}
//                             className="h-full"
//                           >
//                             <Ellipsis className="size-4" />
//                           </PopoverTrigger>
//                           <PopoverContent className="w-30">
//                             <Button
//                               size={"sm"}
//                               variant={"destructive"}
//                               // className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 onDeleteConversation(conversation.id);
//                               }}
//                             >
//                               <Trash2 className="h-3 w-3" /> Delete
//                             </Button>
//                           </PopoverContent>
//                         </Popover>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   ))}
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//           )}
//         </ScrollArea>
//       </SidebarContent>

//       <SidebarFooter className="border-t p-4">
//         <div className="text-muted-foreground flex items-center gap-2 text-sm">
//           <History className="size-4" />
//           <span>{conversations.length} conversations</span>
//         </div>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

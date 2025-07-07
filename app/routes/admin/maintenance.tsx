// import type { Route } from "./+types/maintenance";
// import { json } from "@remix-run/node";
// import { useLoaderData, useFetcher } from "@remix-run/react";
// import { requireAdmin } from "~/utils/permissions.server";
// import {
//   cleanupExpiredLogs,
//   getLogStatistics,
//   estimateLogSpaceUsage,
// } from "~/utils/audit-log-cleanup.server";
// import { runCronJobs, getCronJobs } from "~/utils/cron.server";
// import { Button } from "~/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "~/components/ui/card";
// import { Badge } from "~/components/ui/badge";
// import { Alert, AlertDescription } from "~/components/ui/alert";
// import { Loader2, Trash2, Archive, Database, Clock } from "lucide-react";

// export async function loader(loaderArgs: Route.LoaderArgs) {
//   await requireAdmin(loaderArgs.request);

//   const [stats, spaceUsage, cronJobs] = await Promise.all([
//     getLogStatistics(),
//     estimateLogSpaceUsage(),
//     getCronJobs(),
//   ]);

//   return json({
//     stats,
//     spaceUsage,
//     cronJobs,
//   });
// }

// export async function action(actionArgs: Route.ActionArgs) {
//   await requireAdmin(actionArgs.request);
//   const formData = await actionArgs.request.formData();
//   const action = formData.get("action") as string;

//   try {
//     switch (action) {
//       case "cleanup-logs":
//         const dryRun = formData.get("dryRun") === "true";
//         const result = await cleanupExpiredLogs({
//           dryRun,
//           batchSize: 1000,
//           archiveToFile: true,
//           compressArchives: true,
//         });
//         return json({ success: true, result });

//       case "run-cron-jobs":
//         const cronResults = await runCronJobs();
//         return json({ success: true, cronResults });

//       default:
//         return json(
//           { success: false, error: "Invalid action" },
//           { status: 400 },
//         );
//     }
//   } catch (error) {
//     return json({ success: false, error: String(error) }, { status: 500 });
//   }
// }

// export default function MaintenancePage() {
//   const { stats, spaceUsage, cronJobs } = useLoaderData<typeof loader>();
//   const fetcher = useFetcher();
//   const isSubmitting = fetcher.state === "submitting";

//   const handleCleanup = (dryRun: boolean = false) => {
//     fetcher.submit(
//       { action: "cleanup-logs", dryRun: dryRun.toString() },
//       { method: "POST" },
//     );
//   };

//   const handleRunCronJobs = () => {
//     fetcher.submit({ action: "run-cron-jobs" }, { method: "POST" });
//   };

//   return (
//     <div className="container mx-auto space-y-6 py-8">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold">System Maintenance</h1>
//         <Badge variant="outline" className="flex items-center gap-2">
//           <Database className="h-4 w-4" />
//           Database Management
//         </Badge>
//       </div>

//       {/* Log Statistics */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Clock className="h-5 w-5" />
//             Audit Log Statistics
//           </CardTitle>
//           <CardDescription>
//             Current state of audit logs in the database
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//             <div className="text-center">
//               <div className="text-2xl font-bold">
//                 {stats.totalLogs.toLocaleString()}
//               </div>
//               <div className="text-muted-foreground text-sm">Total Logs</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold">
//                 {spaceUsage.estimatedSizeMB} MB
//               </div>
//               <div className="text-muted-foreground text-sm">
//                 Estimated Size
//               </div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold">{stats.dateRange}</div>
//               <div className="text-muted-foreground text-sm">Days of Data</div>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <h4 className="font-medium">Logs by Severity</h4>
//             <div className="flex flex-wrap gap-2">
//               {stats.logsBySeverity.map((item) => (
//                 <Badge key={item.severity} variant="secondary">
//                   {item.severity}: {item._count.id}
//                 </Badge>
//               ))}
//             </div>
//           </div>

//           <div className="space-y-2">
//             <h4 className="font-medium">Logs by Module</h4>
//             <div className="flex flex-wrap gap-2">
//               {stats.logsByModule.map((item) => (
//                 <Badge key={item.module} variant="outline">
//                   {item.module}: {item._count.id}
//                 </Badge>
//               ))}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Cleanup Actions */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Trash2 className="h-5 w-5" />
//             Log Cleanup
//           </CardTitle>
//           <CardDescription>
//             Clean up expired logs and free database space
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex gap-2">
//             <Button
//               onClick={() => handleCleanup(true)}
//               disabled={isSubmitting}
//               variant="outline"
//             >
//               {isSubmitting ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <Archive className="h-4 w-4" />
//               )}
//               Dry Run
//             </Button>
//             <Button
//               onClick={() => handleCleanup(false)}
//               disabled={isSubmitting}
//               variant="destructive"
//             >
//               {isSubmitting ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <Trash2 className="h-4 w-4" />
//               )}
//               Cleanup Logs
//             </Button>
//           </div>

//           <Alert>
//             <AlertDescription>
//               <strong>Retention Policy:</strong> Logs are automatically archived
//               after 60 days and can be safely deleted. The cleanup process will
//               archive logs to compressed JSON files before deletion.
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>

//       {/* Cron Jobs */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Cron Jobs</CardTitle>
//           <CardDescription>Automated maintenance tasks</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-2">
//             {cronJobs.map((job) => (
//               <div
//                 key={job.name}
//                 className="flex items-center justify-between rounded border p-3"
//               >
//                 <div>
//                   <div className="font-medium">{job.name}</div>
//                   <div className="text-muted-foreground text-sm">
//                     Schedule: {job.schedule}
//                   </div>
//                 </div>
//                 <Badge variant={job.enabled ? "default" : "secondary"}>
//                   {job.enabled ? "Enabled" : "Disabled"}
//                 </Badge>
//               </div>
//             ))}
//           </div>

//           <Button
//             onClick={handleRunCronJobs}
//             disabled={isSubmitting}
//             className="mt-4"
//           >
//             {isSubmitting ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               <Database className="h-4 w-4" />
//             )}
//             Run Cron Jobs
//           </Button>
//         </CardContent>
//       </Card>

//       {/* Results */}
//       {fetcher.data && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Operation Results</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <pre className="bg-muted overflow-auto rounded p-4 text-sm">
//               {JSON.stringify(fetcher.data, null, 2)}
//             </pre>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

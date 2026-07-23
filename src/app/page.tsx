import { Dashboard } from "@/components/dashboard/Dashboard";
import { demoProject } from "@/data/demo-project";

export default function Home() {
  return <Dashboard project={demoProject} />;
}

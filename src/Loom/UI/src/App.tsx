import { TopBar, RootBackground, Playground } from '@/components';
import { TooltipProvider } from "@shadcn/components/ui";
import { DockerConnectionState } from "@/components/DockerConnectionState.tsx";

export default function App() {
  return (
    <div>
      <TooltipProvider>
        <RootBackground >
          <TopBar />
          <Playground />
          <DockerConnectionState />
        </RootBackground>
      </TooltipProvider>
    </div>
  )
}
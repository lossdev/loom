import { TopBar, RootBackground, Playground } from '@/components';
import { TooltipProvider } from "@shadcn/components/ui";

export default function App() {
  return (
    <div>
      <TooltipProvider>
        <RootBackground >
          <TopBar />
          <Playground />
        </RootBackground>
      </TooltipProvider>
    </div>
  )
}
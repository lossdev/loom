import { TopBar } from './components/TopBar.tsx'
import { RootBackground } from "./components/RootBackground.tsx";
import {Playground} from "@/components/Playground.tsx";

export default function App() {
  return (
    <div>
      <RootBackground >
        <TopBar />
        <Playground />
      </RootBackground>
    </div>
  )
}
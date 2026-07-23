import { DeskScene } from "@/components/desk/DeskScene";

// The landing page IS the desk: a full-viewport, stepped tour. The centered
// pill nav (layout) and the desk hotspots both route to the four sections.
export default function Home() {
  return <DeskScene />;
}

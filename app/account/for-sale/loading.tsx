import { TabLoading } from "../TabStates";

// While the For sale tab loads (SPEC · Shared rules; story 31).
export default function Loading() {
  return <TabLoading label="Loading your listings…" />;
}

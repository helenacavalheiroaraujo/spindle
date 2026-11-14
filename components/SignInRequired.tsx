// A page that needs an account, opened by its address while signed out (story 29, design option C): only the header,
// the rest of the page empty, and the log-in window on top. After logging in, the same page loads with its content;
// closing the window goes back, or home. `path` is this page's address (which window it opens: gatePurpose).
import { Header } from "./Header";
import { LoginGate } from "./LoginGate";
import { gatePurpose, type LoginRecord } from "@/lib/rules/loginWindow";

export function SignInRequired({ path, record }: { path: string; record?: LoginRecord }) {
  return (
    <main className="px-4 pb-16 page-main">
      <Header />
      <LoginGate purpose={gatePurpose(path) ?? "menu"} record={record} />
    </main>
  );
}

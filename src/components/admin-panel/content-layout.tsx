import { Navbar } from "~/components/admin-panel/navbar";
import { cn } from "~/lib/utils";

interface ContentLayoutProps {
  title: string;
  container?: boolean,
  children: React.ReactNode;
  className?: string
}

export function ContentLayout({ title, container = true, children, className }: ContentLayoutProps) {
  return (
    <div className={cn("flex flex-col flex-grow", className)}>
      <Navbar title={title} />
      <div className={cn(
        "flex flex-col flex-grow pt-8 pb-8 px-4 sm:px-8",
        container ? "container" : ""
      )}>
        {children}
      </div>
    </div>
  );
}

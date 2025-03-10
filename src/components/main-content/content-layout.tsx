
import Navbar from "~/components/main-content/navbar";
import { cn } from "~/lib/utils";

interface ContentLayoutProps {
  children: React.ReactNode;
  container?: boolean,
  className?: string,
  classNameContainer?: string
}

export function ContentLayout({ container = true, children, className, classNameContainer }: ContentLayoutProps) {
  return (
    <div className={cn("flex flex-col flex-grow", className)}>
      <Navbar />
      <div className={cn(
        "flex flex-col flex-grow pt-8 pb-8 px-4 sm:px-8 bg-secondary min-h-[calc(100vh-56px)]",
        container ? "container" : "",
        classNameContainer
      )}>
        {children}
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";

interface KeyboardShortcutsOptions {
  commandKey?: () => void;
  goToInbox?: () => void;
  goToCalendar?: () => void;
  goToDashboard?: () => void;
  goToBriefing?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  // Use refs to hold options so they don't cause effect re-runs
  const optionsRef = useRef(options);
  
  // Update refs whenever options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore events when typing in inputs or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const { commandKey, goToInbox, goToCalendar, goToDashboard, goToBriefing } = optionsRef.current;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const key = e.key.toLowerCase();
      const ctrlK = (isMac ? e.metaKey : e.ctrlKey) && key === "k";

      if (ctrlK) {
        e.preventDefault();
        e.stopPropagation();
        commandKey?.();
        return;
      }

      if (e.altKey) {
        if (key === "i") {
          e.preventDefault();
          e.stopPropagation();
          goToInbox?.();
        } else if (key === "c") {
          e.preventDefault();
          e.stopPropagation();
          goToCalendar?.();
        } else if (key === "d") {
          e.preventDefault();
          e.stopPropagation();
          goToDashboard?.();
        } else if (key === "b") {
          e.preventDefault();
          e.stopPropagation();
          goToBriefing?.();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array - only attach once!
}

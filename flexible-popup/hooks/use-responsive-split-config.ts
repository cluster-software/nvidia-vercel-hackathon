import { useState, useEffect, useMemo } from "react";
import { Breakpoint } from "../../ui";

interface ResponsiveSplitConfig {
  split_ratio?: {
    [key: string]: string;
    default: string;
  };
  mobile_stack_direction?: string;
  popup_config?: any;
}

interface UseResponsiveSplitConfigProps {
  config: ResponsiveSplitConfig;
  isPreviewMode?: boolean;
  overrideBreakpoint?: Breakpoint;
}

export const useResponsiveSplitConfig = ({
  config,
  isPreviewMode = false,
  overrideBreakpoint,
}: UseResponsiveSplitConfigProps) => {
  // Track current breakpoint
  const [detectedBreakpoint, setDetectedBreakpoint] = useState<Breakpoint | null>(null);

  // Use override if provided, otherwise use detected breakpoint
  const currentBreakpoint = overrideBreakpoint !== undefined ? overrideBreakpoint : detectedBreakpoint;

  // Define breakpoints in descending order (most specific first)
  const breakpoints = useMemo(
    () => [
      { name: "max-sm" as Breakpoint, query: "(max-width: 639px)" },
      { name: "max-md" as Breakpoint, query: "(max-width: 767px)" },
      { name: "max-lg" as Breakpoint, query: "(max-width: 1023px)" },
      { name: "max-xl" as Breakpoint, query: "(max-width: 1279px)" },
      { name: "max-2xl" as Breakpoint, query: "(max-width: 1535px)" },
    ],
    []
  );

  // Set up media query listeners
  useEffect(() => {
    // Skip media query setup if overrideBreakpoint is provided
    if (overrideBreakpoint !== undefined) return;

    // Create media query list for each breakpoint
    const mediaQueries = breakpoints.map((bp) => ({
      ...bp,
      mql: window.matchMedia(bp.query),
    }));

    // Function to update current breakpoint
    const updateBreakpoint = () => {
      // Find the first matching breakpoint (most specific)
      const match = mediaQueries.find((bp) => bp.mql.matches);
      setDetectedBreakpoint(match ? match.name : null);
    };

    // Set initial breakpoint
    updateBreakpoint();

    // Add event listeners
    mediaQueries.forEach((bp) => {
      bp.mql.addEventListener("change", updateBreakpoint);
    });

    // Clean up event listeners
    return () => {
      mediaQueries.forEach((bp) => {
        bp.mql.removeEventListener("change", updateBreakpoint);
      });
    };
  }, [breakpoints, overrideBreakpoint]);

  // Compute the final split ratio based on current breakpoint
  const splitRatio = useMemo(() => {
    if (!config.split_ratio) return "50/50";

    // If we have a breakpoint-specific ratio, use it
    if (currentBreakpoint && config.split_ratio[currentBreakpoint]) {
      return config.split_ratio[currentBreakpoint];
    }

    // Otherwise fall back to default
    return config.split_ratio.default || "50/50";
  }, [config.split_ratio, currentBreakpoint]);

  // Generate split styles based on ratio
  const splitStyles = useMemo(() => {
    const [leftRatio, rightRatio] = splitRatio.split("/");
    return {
      left: {
        flex: `${leftRatio} 1 0%`,
      },
      right: {
        flex: `${rightRatio} 1 0%`,
      },
    };
  }, [splitRatio]);

  return {
    splitRatio,
    splitStyles,
    currentBreakpoint,
    mobileStackDirection: config.mobile_stack_direction || "right_first",
    popupConfig: config.popup_config || {},
  };
}; 
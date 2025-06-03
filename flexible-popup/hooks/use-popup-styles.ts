import { useMemo, useEffect } from "react";
import { FlexibleContent, GradientStop, Breakpoint } from "../../ui";
import { useResponsiveSplitConfig } from "./use-responsive-split-config";

interface UsePopupStylesProps {
  flexible_content: FlexibleContent;
  isPreviewMode: boolean;
  overrideBreakpoint?: Breakpoint;
}

export const usePopupStyles = ({
  flexible_content,
  isPreviewMode,
  overrideBreakpoint,
}: UsePopupStylesProps) => {
  const { layout } = flexible_content;
  const isSplitLayout = layout?.type === "split";
  const isStackedLayout = layout?.type === "stacked";

  // Get config for split layout
  const splitConfig = useMemo(() => {
    if (isSplitLayout && layout.custom_properties) {
      return {
        split_ratio: layout.custom_properties.split_ratio || {
          default: "50/50",
        },
        mobile_stack_direction:
          layout.custom_properties.mobile_stack_direction || "right_first",
        popup_config: layout.custom_properties.popup_config || {},
      };
    }
    return {
      split_ratio: {
        default: "50/50",
      },
      mobile_stack_direction: "right_first",
      popup_config: {},
    };
  }, [isSplitLayout, layout?.custom_properties]);

  // Get config for stacked layout
  const stackedConfig = useMemo(() => {
    if (isStackedLayout && layout.custom_properties) {
      return {
        popup_config: layout.custom_properties.popup_config || {},
      };
    }
    return {
      popup_config: {},
    };
  }, [isStackedLayout, layout?.custom_properties]);

  // Get popup config based on layout type
  const popupConfig = useMemo(() => {
    if (isSplitLayout) {
      return splitConfig.popup_config || {};
    } else if (isStackedLayout) {
      return stackedConfig.popup_config || {};
    }
    return {};
  }, [
    isSplitLayout,
    isStackedLayout,
    splitConfig.popup_config,
    stackedConfig.popup_config,
  ]);

  const overlayConfig = popupConfig.overlay || {};
  const closeButtonConfig = popupConfig.close_button || {};

  // Use the new responsive split config hook
  const { splitStyles, splitRatio, mobileStackDirection } =
    useResponsiveSplitConfig({
      config: splitConfig,
      isPreviewMode,
      overrideBreakpoint,
    });

  const { baseStyles, mediaQueries } = useMemo(() => {
    const baseStyles = {
      width: popupConfig.responsive?.default?.width,
      height: popupConfig.responsive?.default?.height,
    };

    const breakpointOrder = ["max-2xl", "max-xl", "max-lg", "max-md", "max-sm"];

    // Only generate media queries if in preview mode
    const mediaQueries = isPreviewMode
      ? breakpointOrder
          .filter((breakpoint) => popupConfig.responsive?.[breakpoint])
          .map((breakpoint) => {
            const values = popupConfig.responsive[breakpoint];
            const mediaQueryMap = {
              "max-sm": "@media (max-width: 639px)",
              "max-md": "@media (max-width: 767px)",
              "max-lg": "@media (max-width: 1023px)",
              "max-xl": "@media (max-width: 1279px)",
              "max-2xl": "@media (max-width: 1535px)",
            };

            const mediaQuery =
              mediaQueryMap[breakpoint as keyof typeof mediaQueryMap];
            if (!mediaQuery) return "";

            return `
        ${mediaQuery} {
          .popup-container {
            width: ${values.width} !important;
            height: ${values.height} !important;
            max-width: 100vw !important;
            max-height: 100dvh !important;
          }
        }
      `;
          })
          .join("\n")
      : "";

    return { baseStyles, mediaQueries };
  }, [popupConfig, isPreviewMode]);

  useEffect(() => {
    if (!mediaQueries) return;

    const styleEl = document.createElement("style");
    styleEl.textContent = mediaQueries;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, [mediaQueries]);

  const containerStyles = useMemo(() => {
    // For editor mode, use full height and width
    if (!isPreviewMode) {
      return {
        width: "100%",
        height: "100%",
      };
    }

    // For preview mode, use responsive settings from config
    return baseStyles;
  }, [isPreviewMode, baseStyles]);

  const backgroundStyles = useMemo(() => {
    const styles: Record<string, string> = {};

    // Get gradient config
    const gradientConfig = popupConfig.gradient || {};

    // Add gradient if available
    if (
      gradientConfig &&
      gradientConfig.stops &&
      gradientConfig.stops.length > 0
    ) {
      const gradientStops = gradientConfig.stops
        .map((stop: GradientStop) => `${stop.color} ${stop.position}%`)
        .join(", ");

      const gradientDirection = gradientConfig.direction || "to bottom";
      const gradientType = gradientConfig.type || "linear";

      const gradientString = `${gradientType}-gradient(${gradientDirection}, ${gradientStops})`;

      styles.backgroundImage = gradientString;
    }

    // Set background color if no gradient
    styles.backgroundColor = !styles.backgroundImage ? "white" : "transparent";

    return styles;
  }, [popupConfig]);

  return {
    containerStyles,
    backgroundStyles,
    splitStyles,
    overlayConfig,
    closeButtonConfig,
    splitConfig: {
      ...splitConfig,
      splitRatio,
      mobileStackDirection,
    },
  };
};

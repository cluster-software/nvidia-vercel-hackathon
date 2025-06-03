import { useMemo } from "react";

interface UseLayoutSectionsProps {
  layout: any;
  sections: any;
  isSplitLayout: boolean;
}

export const useLayoutSections = ({
  layout,
  sections,
  isSplitLayout,
}: UseLayoutSectionsProps) => {
  // Get sections for each slot in split layout
  const leftSection = useMemo(() => {
    if (isSplitLayout && layout.slot_mapping) {
      const leftSlotId = Object.entries(layout.slot_mapping).find(
        ([_, slot]) => slot === "left"
      )?.[0];
      return leftSlotId ? sections[leftSlotId] : null;
    }
    return null;
  }, [isSplitLayout, layout?.slot_mapping, sections]);

  const rightSection = useMemo(() => {
    if (isSplitLayout && layout.slot_mapping) {
      const rightSlotId = Object.entries(layout.slot_mapping).find(
        ([_, slot]) => slot === "right"
      )?.[0];
      return rightSlotId ? sections[rightSlotId] : null;
    }
    return null;
  }, [isSplitLayout, layout?.slot_mapping, sections]);

  return {
    leftSection,
    rightSection,
  };
};

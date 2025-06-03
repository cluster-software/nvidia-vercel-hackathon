import React from "react";
import { FlexibleContentRenderer } from "../components/flexible-content-renderer";
import sampleFlexibleContent from "../data/sample-flexible-content.json";
import { FlexibleContent } from "../ui";

const HomePage: React.FC = () => {
  return (
    <div className="App">
      <FlexibleContentRenderer
        flexibleContent={sampleFlexibleContent as FlexibleContent}
        title="v0 for Popups Demo"
      />
    </div>
  );
};

export default HomePage;
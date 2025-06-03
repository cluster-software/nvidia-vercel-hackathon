# Flexible Content Renderer

A standalone component that renders flexible content JSON structures with desktop/mobile preview toggles. This is extracted from the cluster-monorepo popup editor, keeping only the rendering functionality.

## Features

- **Device Toggle**: Switch between desktop and mobile preview modes
- **Flexible Layouts**: Support for split, stacked, and default layouts
- **Responsive Design**: Components adapt to different screen sizes
- **Component Types**: Support for text, image, button, input, quiz options, and more
- **Collapsible Sidebar**: View JSON structure and metadata
- **Preview Only**: No editing capabilities, pure rendering

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Load Your JSON**
   Replace the sample data in `data/sample-flexible-content.json` with your own flexible content JSON structure.

## Usage

### Basic Usage

```tsx
import { FlexibleContentRenderer } from './components/flexible-content-renderer';
import flexibleContent from './data/your-content.json';

function App() {
  return (
    <FlexibleContentRenderer
      flexibleContent={flexibleContent}
      title="My Content Preview"
    />
  );
}
```

### Flexible Content Structure

Your JSON should follow this structure:

```json
{
  "layout": {
    "type": "split", // or "stacked", "default"
    "slot_mapping": {
      "section_1": "left",
      "section_2": "right"
    },
    "custom_properties": {
      "split_ratio": "50:50",
      "mobile_stack_direction": "left_first"
    }
  },
  "sections": {
    "section_1": {
      "id": "section_1",
      "name": "Left Content",
      "components": [...],
      "styles": {...}
    }
  }
}
```

## Component Types

### Text Component
```json
{
  "type": "text",
  "properties": {
    "content": "Hello World",
    "font": "text-xl font-bold"
  }
}
```

### Image Component
```json
{
  "type": "image",
  "properties": {
    "src": "https://example.com/image.jpg",
    "alt": "Description"
  }
}
```

### Button Component
```json
{
  "type": "button",
  "properties": {
    "content": "Click Me",
    "action": "submit"
  }
}
```

### Input Component
```json
{
  "type": "input",
  "properties": {
    "input_type": "email",
    "placeholder": "Enter email",
    "required": true
  }
}
```

## Device Toggle

The device toggle allows you to preview your content as it would appear on:

- **Desktop**: Uses default responsive breakpoints
- **Mobile**: Forces `max-sm` breakpoint styles (max-width: 639px)

## Responsive Styles

Each component and section can have breakpoint-specific styles:

```json
{
  "styles": {
    "default": {
      "padding": "32px",
      "fontSize": "16px"
    },
    "max-sm": {
      "padding": "16px",
      "fontSize": "14px"
    }
  }
}
```

## Layout Types

### Split Layout
- Divides content into left and right sections
- Configurable split ratios (e.g., "60:40", "50:50")
- Mobile stacking with configurable order

### Stacked Layout
- Stacks sections vertically
- Good for multi-step flows

### Default Layout
- Simple vertical layout
- Sections render in order

## File Structure

```
├── components/
│   ├── flexible-content-renderer.tsx    # Main renderer component
│   ├── device-toggle.tsx                # Desktop/mobile toggle
│   ├── collapsible-chat-pane.tsx        # Sidebar for JSON preview
│   └── spinner.tsx                      # Loading spinner
├── flexible-popup/                      # Core rendering components
│   ├── index.tsx                        # FlexiblePopup component
│   ├── components/                      # Individual component renderers
│   ├── hooks/                           # Custom hooks for styling
│   └── utils/                           # Validation and utilities
├── data/
│   └── sample-flexible-content.json     # Sample data
├── lib/
│   └── utils.ts                         # Utility functions
├── types/
│   └── popup.ts                         # Type definitions
├── ui.ts                                # UI type definitions
└── app.tsx                              # Main app component
```

## Customization

### Adding New Component Types

1. Add the component type to `ui.ts` ComponentType enum
2. Create the component renderer in `flexible-popup/components/flexible-component.tsx`
3. Add any specific properties to the interfaces

### Styling

The renderer uses Tailwind CSS for styling. You can customize:

- Default component styles in `flexible-component.tsx`
- Layout styles in responsive hooks
- Overall app styles in your CSS files

## Notes

- This is a preview-only tool - no backend integration required
- Form submissions are no-op functions for demonstration
- Responsive behavior is controlled by the `overrideBreakpoint` prop
- All components support custom styling through the flexible content JSON structure
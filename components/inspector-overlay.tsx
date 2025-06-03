import React, { useEffect, useState, useCallback } from "react";

interface InspectorOverlayProps {
  isActive: boolean;
  onComponentSelect: (path: string | null) => void;
  selectedComponentPath: string | null;
}

export const InspectorOverlay: React.FC<InspectorOverlayProps> = ({
  isActive,
  onComponentSelect,
  selectedComponentPath,
}) => {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  const getComponentPath = useCallback((element: HTMLElement): string => {
    // Try to find the component path from data attributes or element structure
    let currentElement = element;
    
    while (currentElement && currentElement !== document.body) {
      // Check for section ID
      if (currentElement.id && currentElement.id.includes('section')) {
        const sectionId = currentElement.id;
        // Check if this element has a component child
        const componentChild = currentElement.querySelector('[data-component-id]');
        if (componentChild) {
          const componentId = componentChild.getAttribute('data-component-id');
          return `sections.${sectionId}.components.${componentId}`;
        }
        return `sections.${sectionId}`;
      }
      
      // Check for component data attribute
      const componentId = currentElement.getAttribute('data-component-id');
      if (componentId) {
        // Find parent section
        let sectionElement = currentElement.parentElement;
        while (sectionElement && !sectionElement.id?.includes('section')) {
          sectionElement = sectionElement.parentElement;
        }
        if (sectionElement?.id) {
          return `sections.${sectionElement.id}.components.${componentId}`;
        }
        return `components.${componentId}`;
      }

      currentElement = currentElement.parentElement as HTMLElement;
    }

    return 'layout';
  }, []);

  const addHighlight = useCallback((element: HTMLElement, type: 'hover' | 'selected') => {
    const rect = element.getBoundingClientRect();
    const highlightId = `inspector-${type}`;
    
    // Remove existing highlight
    const existing = document.getElementById(highlightId);
    if (existing) existing.remove();

    // Create new highlight
    const highlight = document.createElement('div');
    highlight.id = highlightId;
    highlight.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      border: 2px solid ${type === 'hover' ? '#3b82f6' : '#ef4444'};
      background: ${type === 'hover' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
      border-radius: 4px;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      transition: all 0.1s ease;
    `;

    document.body.appendChild(highlight);
  }, []);

  const removeHighlight = useCallback((type: 'hover' | 'selected') => {
    const highlight = document.getElementById(`inspector-${type}`);
    if (highlight) highlight.remove();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive) return;

    const element = e.target as HTMLElement;
    if (!element || element === hoveredElement) return;

    // Remove previous hover highlight
    removeHighlight('hover');
    
    // Skip if clicking on inspector overlay itself
    if (element.closest('[data-inspector-overlay]')) return;

    // Only highlight elements within the preview area
    const previewArea = document.querySelector('[data-preview-area]');
    if (!previewArea || !previewArea.contains(element)) return;

    setHoveredElement(element);
    addHighlight(element, 'hover');
  }, [isActive, hoveredElement, addHighlight, removeHighlight]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isActive) return;

    const element = e.target as HTMLElement;
    if (!element) return;

    // Skip if clicking on inspector overlay itself
    if (element.closest('[data-inspector-overlay]')) return;

    // Check if click is within the preview area
    const previewArea = document.querySelector('[data-preview-area]');
    if (!previewArea || !previewArea.contains(element)) {
      // Clicking outside preview area - don't change selection, just return
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const path = getComponentPath(element);
    
    if (selectedElement === element) {
      // Deselect if clicking the same element
      setSelectedElement(null);
      onComponentSelect(null);
      removeHighlight('selected');
    } else {
      // Select new element
      setSelectedElement(element);
      onComponentSelect(path);
      removeHighlight('selected');
      addHighlight(element, 'selected');
    }
  }, [isActive, selectedElement, getComponentPath, onComponentSelect, addHighlight, removeHighlight]);

  // Remove hover highlights when moving outside preview area
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!isActive) return;

    const element = e.target as HTMLElement;
    const previewArea = document.querySelector('[data-preview-area]');
    
    // If mouse leaves the preview area, remove hover highlight
    if (previewArea && !previewArea.contains(element)) {
      removeHighlight('hover');
      setHoveredElement(null);
    }
  }, [isActive, removeHighlight]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mousemove', handleMouseLeave);
      document.addEventListener('click', handleClick, true);
      
      // Add cursor style
      document.body.style.cursor = 'crosshair';
    } else {
      // Clean up
      setHoveredElement(null);
      setSelectedElement(null);
      removeHighlight('hover');
      removeHighlight('selected');
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleMouseLeave);
      document.removeEventListener('click', handleClick, true);
      if (isActive) {
        document.body.style.cursor = '';
      }
    };
  }, [isActive, handleMouseMove, handleMouseLeave, handleClick, removeHighlight]);

  // Update highlights when selectedComponentPath changes externally
  useEffect(() => {
    if (!selectedComponentPath) {
      removeHighlight('selected');
      setSelectedElement(null);
    }
  }, [selectedComponentPath, removeHighlight]);

  return (
    <>
      {isActive && (
        <div
          data-inspector-overlay
          className="fixed inset-0 z-40 pointer-events-none"
          style={{ cursor: 'crosshair' }}
        />
      )}
    </>
  );
};
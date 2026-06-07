import { DiagramElement } from "./types";

export function highlightDiagramElements(
  elements: DiagramElement[],
  highlightIds: string[]
): DiagramElement[] {
  return elements.map((el) => {
    if (highlightIds.includes(el.id)) {
      return {
        ...el,
        backgroundColor: "#ffeb3b",
        opacity: 1,
        strokeWidth: 3,
      };
    } else {
      return {
        ...el,
        opacity: 0.3,
        strokeWidth: 1,
      };
    }
  });
}

export function resetDiagramElements(elements: DiagramElement[]): DiagramElement[] {
  return elements.map((el) => ({
    ...el,
    opacity: 1,
    strokeWidth: 2,
  }));
}

export function getDiagramDimensions(elements: DiagramElement[]): {
  width: number;
  height: number;
} {
  let maxX = 0;
  let maxY = 0;

  elements.forEach((el) => {
    if (el.x !== undefined && el.width !== undefined) {
      maxX = Math.max(maxX, el.x + el.width);
    }
    if (el.y !== undefined && el.height !== undefined) {
      maxY = Math.max(maxY, el.y + el.height);
    }
  });

  return {
    width: maxX,
    height: maxY,
  };
}

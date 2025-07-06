import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AgendaGridInner } from "./AgendaGridInner";
import { AgendaGridProps } from "./types";
import "./styles.css";

export const AgendaGrid: React.FC<AgendaGridProps> = (props) => (
  <DndProvider backend={HTML5Backend}>
    <div className="overflow-x-auto">
      <AgendaGridInner {...props} />
    </div>
  </DndProvider>
);

export type { AgendaGridProps } from "./types";
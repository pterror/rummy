import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import React, { useCallback } from "react";
import { useImmer } from "use-immer";
import { Card } from "../cards";
import { CardComponent } from "./Card";
import "./Hand.css";
import { SortableItem } from "./SortableItem";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

export type HandProps = {
  cards: Card[];
};

export const Hand: React.FC<HandProps> = ({ cards }) => {
  const [sortedCards, updateSortedCards] = useImmer(cards);
  const [selectedCards, updateSelectedCards] = useImmer<Set<Card>>(new Set());
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleClick = useCallback(
    (card: Card) => {
      return updateSelectedCards((selectedCards) => {
        if (selectedCards.has(card)) {
          selectedCards.delete(card);
        } else {
          selectedCards.add(card);
        }
      });
    },
    [updateSelectedCards]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        updateSortedCards((items) => {
          const oldIndex = items.indexOf(active.id as Card);
          const newIndex = items.indexOf(over.id as Card);

          const item = items.splice(oldIndex, 1);
          items.splice(newIndex, 0, ...item);
        });
        handleClick(active.id as Card);
      }
    },
    [updateSortedCards, handleClick]
  );

  return (
    <div className="hand">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
        <SortableContext
          items={sortedCards}
          strategy={horizontalListSortingStrategy}
        >
          {sortedCards.map((card) => (
            <SortableItem key={card} id={card}>
              <div
                className={`card ${selectedCards.has(card) ? "selected" : ""}`}
              >
                <CardComponent card={card} key={card} onClick={handleClick} />
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

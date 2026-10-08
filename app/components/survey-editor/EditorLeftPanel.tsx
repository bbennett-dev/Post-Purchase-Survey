import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CHANNEL_LABELS,
  endingTitle,
  QUESTION_TYPES,
} from "../../lib/survey/questions";
import type { SurveyQuestion } from "../../lib/survey/types";
import type {
  EditorPanel,
  QuestionType,
  SurveyDocument,
} from "../../lib/survey/types";
import { EndingRow } from "./EndingRow";
import { fieldValue } from "./field-value";
import { QuestionDragPreview } from "./QuestionDragPreview";
import { QuestionRow } from "./QuestionRow";
import styles from "./question-drag.module.css";

interface EditorLeftPanelProps {
  survey: SurveyDocument;
  panel: EditorPanel;
  renaming: boolean;
  selectedQuestionId: string;
  selectedEndingId: string | null;
  showTranslationTip: boolean;
  onPanel: (panel: EditorPanel) => void;
  onRenaming: (renaming: boolean) => void;
  onRename: (name: string) => void;
  onSelectQuestion: (id: string) => void;
  onSelectEnding: (id: string) => void;
  onDismissTranslation: () => void;
  onAddQuestion: (type: QuestionType) => void;
  onMoveQuestion: (id: string, direction: -1 | 1) => void;
  onReorderQuestion: (order: string[]) => void;
  onDeleteQuestion: (id: string) => void;
  onAddEnding: () => void;
  onSetMain: (id: string) => void;
  onDeleteEnding: (id: string) => void;
}

/**
 * Left editor column: survey name, Content / Channel / Discount, then
 * the list for the selected tab.
 */
export function EditorLeftPanel({
  survey,
  panel,
  renaming,
  selectedQuestionId,
  selectedEndingId,
  showTranslationTip,
  onPanel,
  onRenaming,
  onRename,
  onSelectQuestion,
  onSelectEnding,
  onDismissTranslation,
  onAddQuestion,
  onMoveQuestion,
  onReorderQuestion,
  onDeleteQuestion,
  onAddEnding,
  onSetMain,
  onDeleteEnding,
}: EditorLeftPanelProps) {
  return (
    <s-box
      padding="base"
      background="base"
      border="base"
      borderRadius="base"
      overflow="hidden"
      minBlockSize="720px"
    >
      <s-stack gap="base">
        {renaming ? (
          <s-text-field
            label="Survey name"
            labelAccessibilityVisibility="exclusive"
            value={survey.name}
            onInput={(event) => onRename(fieldValue(event))}
            onBlur={() => onRenaming(false)}
          />
        ) : (
          <s-stack direction="inline" gap="small-200" alignItems="center">
            <s-heading>{survey.name}</s-heading>
            <s-button
              icon="edit"
              variant="tertiary"
              accessibilityLabel="Rename survey"
              onClick={() => onRenaming(true)}
            />
          </s-stack>
        )}

        <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="small-200">
          <s-button
            variant={panel === "content" ? "primary" : "secondary"}
            onClick={() => onPanel("content")}
          >
            Content
          </s-button>
          <s-button
            variant={panel === "channel" ? "primary" : "secondary"}
            onClick={() => onPanel("channel")}
          >
            Channel
          </s-button>
          <s-button
            variant={panel === "discount" ? "primary" : "secondary"}
            onClick={() => onPanel("discount")}
          >
            Discount
          </s-button>
        </s-grid>

        {panel === "content" ? (
          <ContentList
            survey={survey}
            selectedQuestionId={selectedQuestionId}
            selectedEndingId={selectedEndingId}
            showTranslationTip={showTranslationTip}
            onSelectQuestion={onSelectQuestion}
            onSelectEnding={onSelectEnding}
            onDismissTranslation={onDismissTranslation}
            onAddQuestion={onAddQuestion}
            onMoveQuestion={onMoveQuestion}
            onReorderQuestion={onReorderQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onAddEnding={onAddEnding}
            onSetMain={onSetMain}
            onDeleteEnding={onDeleteEnding}
          />
        ) : null}
        {panel === "channel" ? <ChannelSummary survey={survey} /> : null}
        {panel === "discount" ? <DiscountSummary survey={survey} /> : null}
      </s-stack>
    </s-box>
  );
}

const DRAG_THRESHOLD = 5;

interface DragSession {
  id: string;
  x: number;
  y: number;
  insertAt: number;
}

function questionOrder(questions: SurveyQuestion[]): string[] {
  return questions.map((question) => question.id);
}

function orderWithInsert(order: string[], dragId: string, insertAt: number): string[] {
  const others = order.filter((id) => id !== dragId);
  const index = Math.max(0, Math.min(insertAt, others.length));
  return [...others.slice(0, index), dragId, ...others.slice(index)];
}

/**
 * Drop index among the rows that are not being dragged.
 * Uses layout boxes from the row wrappers, not s-box hosts.
 * s-box often reports a 0-height rect, which previously always
 * inserted at the end of the list.
 */
function insertAtFromPoint(
  order: string[],
  dragId: string,
  y: number,
  rows: Map<string, HTMLElement>,
  fallback: number,
): number {
  const others = order.filter((id) => id !== dragId);
  let measured = false;
  let insertAt = others.length;

  for (let index = 0; index < others.length; index += 1) {
    const row = rows.get(others[index]);
    if (!row) {
      continue;
    }

    const rect = row.getBoundingClientRect();
    if (rect.height < 2) {
      continue;
    }

    measured = true;
    if (y < rect.top + rect.height / 2) {
      insertAt = index;
      break;
    }
  }

  return measured ? insertAt : fallback;
}

function QuestionDropLine() {
  return <div className={styles.dropLine} role="presentation" />;
}

/**
 * Last row in a content list. Same icon + label layout as a question,
 * using clickable + info tone so it stays blue text, not a button.
 */
function AddListRow({
  label,
  commandFor,
  onClick,
  menu,
}: {
  label: string;
  commandFor?: string;
  onClick?: () => void;
  menu?: ReactNode;
}) {
  return (
    <>
      <s-clickable
        padding="none small-300 none none"
        borderRadius="base"
        commandFor={commandFor}
        onClick={onClick}
      >
        <s-grid
          gridTemplateColumns="auto minmax(0, 1fr)"
          gap="small-200"
          alignItems="center"
        >
          <s-box padding="small-200">
            <s-icon type="plus" tone="info" />
          </s-box>
          <s-text tone="info">{label}</s-text>
        </s-grid>
      </s-clickable>
      {menu}
    </>
  );
}

function QuestionList({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onMoveQuestion,
  onDeleteQuestion,
  onReorderQuestion,
  onAddQuestion,
}: {
  questions: SurveyQuestion[];
  selectedQuestionId: string;
  onSelectQuestion: (id: string) => void;
  onMoveQuestion: (id: string, direction: -1 | 1) => void;
  onDeleteQuestion: (id: string) => void;
  onReorderQuestion: (order: string[]) => void;
  onAddQuestion: (type: QuestionType) => void;
}) {
  const [pending, setPending] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [drag, setDrag] = useState<DragSession | null>(null);
  const rows = useRef(new Map<string, HTMLElement>());
  const dragRef = useRef<DragSession | null>(null);
  const pendingRef = useRef(pending);
  const questionsRef = useRef(questions);
  const reorderRef = useRef(onReorderQuestion);
  const sessionActive = pending !== null || drag !== null;

  pendingRef.current = pending;
  dragRef.current = drag;
  questionsRef.current = questions;
  reorderRef.current = onReorderQuestion;

  const registerRow = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      rows.current.set(id, element);
      return;
    }
    rows.current.delete(id);
  }, []);

  useEffect(() => {
    if (!sessionActive) {
      return;
    }

    const applyGrabbingCursor = () => {
      document.body.classList.add("survey-question-dragging");
    };

    const startOrMove = (event: PointerEvent) => {
      const activePending = pendingRef.current;
      const activeDrag = dragRef.current;

      if (activePending && !activeDrag) {
        const distance = Math.hypot(
          event.clientX - activePending.x,
          event.clientY - activePending.y,
        );
        if (distance < DRAG_THRESHOLD) {
          return;
        }

        const original = questionOrder(questionsRef.current);
        const next: DragSession = {
          id: activePending.id,
          x: event.clientX,
          y: event.clientY,
          insertAt: insertAtFromPoint(
            original,
            activePending.id,
            event.clientY,
            rows.current,
            original.indexOf(activePending.id),
          ),
        };
        dragRef.current = next;
        applyGrabbingCursor();
        setPending(null);
        setDrag(next);
        return;
      }

      if (!activeDrag) {
        return;
      }

      const original = questionOrder(questionsRef.current);
      const next: DragSession = {
        ...activeDrag,
        x: event.clientX,
        y: event.clientY,
        insertAt: insertAtFromPoint(
          original,
          activeDrag.id,
          event.clientY,
          rows.current,
          activeDrag.insertAt,
        ),
      };
      dragRef.current = next;
      setDrag(next);
    };

    const finish = () => {
      const activeDrag = dragRef.current;
      if (activeDrag) {
        const original = questionOrder(questionsRef.current);
        const nextOrder = orderWithInsert(
          original,
          activeDrag.id,
          activeDrag.insertAt,
        );
        const changed = nextOrder.some((id, index) => id !== original[index]);
        if (changed) {
          reorderRef.current(nextOrder);
        }
      }
      dragRef.current = null;
      pendingRef.current = null;
      setPending(null);
      setDrag(null);
    };

    const cancel = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      dragRef.current = null;
      pendingRef.current = null;
      setPending(null);
      setDrag(null);
    };

    if (dragRef.current) {
      applyGrabbingCursor();
    }

    window.addEventListener("pointermove", startOrMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("keydown", cancel);

    return () => {
      document.body.classList.remove("survey-question-dragging");
      window.removeEventListener("pointermove", startOrMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("keydown", cancel);
    };
  }, [sessionActive]);

  if (questions.length === 0) {
    return (
      <s-stack gap="small-200">
        <s-paragraph color="subdued">No questions yet.</s-paragraph>
        <AddListRow
          label="Add content"
          commandFor="add-question-menu"
          menu={
            <s-menu id="add-question-menu" accessibilityLabel="Add a question">
              {QUESTION_TYPES.map((item) => (
                <s-button
                  key={item.type}
                  icon={item.icon}
                  onClick={() => onAddQuestion(item.type)}
                >
                  {item.label}
                </s-button>
              ))}
            </s-menu>
          }
        />
      </s-stack>
    );
  }

  const draggingQuestion = drag
    ? questions.find((question) => question.id === drag.id)
    : null;
  const others = drag
    ? questions.map((question) => question.id).filter((id) => id !== drag.id)
    : [];
  const dropBeforeId =
    drag && drag.insertAt < others.length ? others[drag.insertAt] : null;

  return (
    <>
      <s-stack gap="small-200">
        {questions.flatMap((question, index) => {
          const row = (
            <QuestionRow
              key={question.id}
              question={question}
              selected={question.id === selectedQuestionId}
              dragging={drag?.id === question.id}
              isFirst={index === 0}
              isLast={index === questions.length - 1}
              onSelect={onSelectQuestion}
              onMove={onMoveQuestion}
              onDelete={onDeleteQuestion}
              onDragStart={(id, point) => {
                setPending({ id, ...point });
              }}
              onRowRef={registerRow}
            />
          );

          if (dropBeforeId === question.id) {
            return [
              <QuestionDropLine key={`drop-${question.id}`} />,
              row,
            ];
          }

          return [row];
        })}
        {drag && dropBeforeId === null ? <QuestionDropLine /> : null}
        <AddListRow
          label="Add content"
          commandFor="add-question-menu"
          menu={
            <s-menu id="add-question-menu" accessibilityLabel="Add a question">
              {QUESTION_TYPES.map((item) => (
                <s-button
                  key={item.type}
                  icon={item.icon}
                  onClick={() => onAddQuestion(item.type)}
                >
                  {item.label}
                </s-button>
              ))}
            </s-menu>
          }
        />
      </s-stack>
      {drag && draggingQuestion ? (
        <QuestionDragPreview
          title={draggingQuestion.heading || "Untitled question"}
          x={drag.x}
          y={drag.y}
        />
      ) : null}
    </>
  );
}

function ContentList({
  survey,
  selectedQuestionId,
  selectedEndingId,
  showTranslationTip,
  onSelectQuestion,
  onSelectEnding,
  onDismissTranslation,
  onAddQuestion,
  onMoveQuestion,
  onReorderQuestion,
  onDeleteQuestion,
  onAddEnding,
  onSetMain,
  onDeleteEnding,
}: Pick<
  EditorLeftPanelProps,
  | "survey"
  | "selectedQuestionId"
  | "selectedEndingId"
  | "showTranslationTip"
  | "onSelectQuestion"
  | "onSelectEnding"
  | "onDismissTranslation"
  | "onAddQuestion"
  | "onMoveQuestion"
  | "onReorderQuestion"
  | "onDeleteQuestion"
  | "onAddEnding"
  | "onSetMain"
  | "onDeleteEnding"
>) {
  return (
    <s-stack gap="small-200">
      <s-text type="strong" color="subdued">
        Content
      </s-text>
      <QuestionList
        questions={survey.questions}
        selectedQuestionId={selectedQuestionId}
        onSelectQuestion={onSelectQuestion}
        onMoveQuestion={onMoveQuestion}
        onDeleteQuestion={onDeleteQuestion}
        onReorderQuestion={onReorderQuestion}
        onAddQuestion={onAddQuestion}
      />
      <s-grid
        gridTemplateColumns="auto minmax(0, 1fr)"
        gap="small-100"
        alignItems="center"
      >
        <s-icon type="lightbulb" color="subdued" size="small" />
        <span className={styles.tip}>
          Best practice: keep this survey to a few questions.
        </span>
      </s-grid>

      <s-divider direction="inline" color="base" />

      <s-text type="strong" color="subdued">
        Endings
      </s-text>
      <s-stack gap="small-200">
        {survey.thankYouCards.map((card, index) => {
          const id = card.id ?? `ending-${index}`;
          return (
            <EndingRow
              key={id}
              card={card}
              index={index}
              selected={id === selectedEndingId}
              title={endingTitle(card, index)}
              onSelect={onSelectEnding}
              onSetMain={onSetMain}
              onDelete={onDeleteEnding}
            />
          );
        })}
        <AddListRow label="Add ending" onClick={onAddEnding} />
      </s-stack>

      {showTranslationTip ? (
        <s-banner
          heading="Surveys work better in the customer's language"
          tone="info"
          dismissible
          onDismiss={onDismissTranslation}
        >
          <s-paragraph>
            Translations for this survey are stored on the document.
          </s-paragraph>
        </s-banner>
      ) : null}
    </s-stack>
  );
}

function ChannelSummary({ survey }: { survey: SurveyDocument }) {
  return (
    <s-stack gap="small-200">
      <s-paragraph color="subdued">
        Channels are stored on the survey. Editing them comes next.
      </s-paragraph>
      {Object.keys(survey.channels).map((name) => (
        <s-stack
          key={name}
          direction="inline"
          gap="small-200"
          alignItems="center"
        >
          <s-text>{CHANNEL_LABELS[name] ?? name}</s-text>
          <s-badge tone={survey.channels[name]?.enabled ? "success" : "warning"}>
            {survey.channels[name]?.enabled ? "On" : "Off"}
          </s-badge>
        </s-stack>
      ))}
    </s-stack>
  );
}

function DiscountSummary({ survey }: { survey: SurveyDocument }) {
  return (
    <s-stack gap="small-200">
      <s-paragraph color="subdued">
        The discount is stored on the survey. Editing it comes next.
      </s-paragraph>
      <s-badge tone={survey.discount.enabled ? "success" : "warning"}>
        {survey.discount.enabled ? "Discount on" : "Discount off"}
      </s-badge>
      {survey.discount.displayText ? (
        <s-text>{survey.discount.displayText}</s-text>
      ) : null}
    </s-stack>
  );
}

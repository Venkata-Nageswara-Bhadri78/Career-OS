import { useState } from "react";
import { CUSTOM_PROMPT_COPY } from "../config/customPromptConfig";
import useCustomPrompts from "../hooks/useCustomPrompts";
import ChatConfirmDialog from "../components/common/ChatConfirmDialog";
import { PlusIcon } from "../components/common/ChatIcons";
import CustomPromptCard from "../components/main-components/CustomPromptCard";
import CustomPromptFormDialog from "../components/main-components/CustomPromptFormDialog";
import CustomPromptsEmptyState from "../components/main-components/CustomPromptsEmptyState";
import CustomPromptsSkeleton from "../components/skeletons/CustomPromptsSkeleton";
import "../styles/chatAssistant.css";

export default function CustomPromptsPage() {
  const { prompts, status, error, busyKey, load, create, update, remove } = useCustomPrompts();
  const [formMode, setFormMode] = useState(null);
  const [activePrompt, setActivePrompt] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const formBusy = formMode === "create" ? busyKey === "create" : Boolean(activePrompt && busyKey === activePrompt.id);
  const deleteBusy = Boolean(pendingDelete && busyKey === pendingDelete.id);

  const closeForm = () => {
    if (formBusy) return;
    setFormMode(null);
    setActivePrompt(null);
  };

  const showNotice = (message) => {
    setNotice(message);
    setActionError("");
  };

  return (
    <div className="chat-assistant-service mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col bg-bg px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Custom Prompts</h1>
        <button
          type="button"
          onClick={() => {
            setActivePrompt(null);
            setFormMode("create");
          }}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white pl-1.5 pr-4 text-sm font-semibold text-ink shadow-sm hover:bg-field"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-white">
            <PlusIcon className="h-3.5 w-3.5" />
          </span>
          <span>Create New Prompt</span>
        </button>
      </header>

      {notice ? (
        <p className="mt-4 rounded-xl border border-line bg-field px-3 py-2 text-sm text-ink" role="status">
          {notice}
        </p>
      ) : null}
      {actionError ? (
        <p className="mt-4 rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="chat-assistant-scroll mt-6 min-h-0 flex-1 overflow-y-auto pb-4">
        {status === "loading" ? <CustomPromptsSkeleton /> : null}

        {status === "error" ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 text-center">
              <h2 className="text-sm font-bold text-ink">Unable to load custom prompts</h2>
              <p className="mt-2 text-sm text-muted" role="alert">
                {error?.message || "Something went wrong."}
              </p>
              <button
                type="button"
                onClick={() => load().catch(() => {})}
                className="mt-5 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          </div>
        ) : null}

        {status === "ready" && prompts.length === 0 ? (
          <CustomPromptsEmptyState
            onCreate={() => {
              setActivePrompt(null);
              setFormMode("create");
            }}
          />
        ) : null}

        {status === "ready" && prompts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((item) => (
              <CustomPromptCard
                key={item.id}
                prompt={item}
                busy={busyKey === item.id}
                onEdit={(next) => {
                  setActivePrompt(next);
                  setFormMode("edit");
                }}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        ) : null}
      </div>

      <CustomPromptFormDialog
        open={formMode === "create" || formMode === "edit"}
        mode={formMode === "edit" ? "edit" : "create"}
        initialPrompt={formMode === "edit" ? activePrompt : null}
        busy={formBusy}
        onClose={closeForm}
        onSubmit={async (title, body) => {
          if (formMode === "edit" && activePrompt) {
            await update(activePrompt.id, title, body);
            showNotice(CUSTOM_PROMPT_COPY.UPDATED);
          } else {
            await create(title, body);
            showNotice(CUSTOM_PROMPT_COPY.CREATED);
          }
          setFormMode(null);
          setActivePrompt(null);
        }}
      />

      <ChatConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete custom prompt"
        message="This removes the saved prompt from your account. Job chats are not changed."
        confirmLabel="Delete"
        busy={deleteBusy}
        onClose={() => {
          if (!deleteBusy) setPendingDelete(null);
        }}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await remove(pendingDelete.id);
            setPendingDelete(null);
            showNotice(CUSTOM_PROMPT_COPY.DELETED);
          } catch (err) {
            setActionError(err?.message || "Something went wrong.");
          }
        }}
      />
    </div>
  );
}

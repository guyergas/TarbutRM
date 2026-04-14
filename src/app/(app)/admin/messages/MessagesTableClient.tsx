"use client";

import { useState } from "react";
import { closeMessageAction, reopenMessageAction } from "./actions";

interface Message {
  id: string;
  email: string;
  name: string | null;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  closedAt: string | null;
}

interface MessagesTableClientProps {
  openMessages: Message[];
  closedMessages: Message[];
}

const statusBadgeConfig: Record<string, { bgClass: string; textClass: string; label: string }> = {
  OPEN: { bgClass: "bg-yellow-100 dark:bg-yellow-900/30", textClass: "text-yellow-700 dark:text-yellow-400", label: "פתוחה" },
  CLOSED: { bgClass: "bg-green-100 dark:bg-green-900/30", textClass: "text-green-700 dark:text-green-400", label: "סגורה" },
};

export default function MessagesTableClient({ openMessages, closedMessages }: MessagesTableClientProps) {
  const [allMessages, setAllMessages] = useState<Message[]>([...openMessages, ...closedMessages]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedMessage = allMessages.find((m) => m.id === selectedMessageId);
  const currentOpenMessages = allMessages.filter((m) => m.status === "OPEN");
  const currentClosedMessages = allMessages.filter((m) => m.status === "CLOSED");

  const handleCloseMessage = async () => {
    if (!selectedMessage) return;
    setActionInProgress(selectedMessage.id);
    setError(null);

    try {
      const result = await closeMessageAction(selectedMessage.id);
      if (result.success) {
        setAllMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMessage.id
              ? { ...m, status: "CLOSED", closedAt: new Date().toLocaleString("he-IL") }
              : m
          )
        );
        setSelectedMessageId(null);
      } else {
        setError(result.error || "אירעה שגיאה");
      }
    } catch (err) {
      setError("אירעה שגיאה בסגירת ההודעה");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReopenMessage = async () => {
    if (!selectedMessage) return;
    setActionInProgress(selectedMessage.id);
    setError(null);

    try {
      const result = await reopenMessageAction(selectedMessage.id);
      if (result.success) {
        setAllMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMessage.id
              ? { ...m, status: "OPEN", closedAt: null }
              : m
          )
        );
        setSelectedMessageId(null);
      } else {
        setError(result.error || "אירעה שגיאה");
      }
    } catch (err) {
      setError("אירעה שגיאה בפתיחת ההודעה");
    } finally {
      setActionInProgress(null);
    }
  };

  const MessageTable = ({ messages, isOpen }: { messages: Message[]; isOpen: boolean }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
              אימייל
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
              כותרת
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
              תאריך
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
              סטטוס
            </th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-3 text-center text-gray-400 dark:text-gray-500">
                {isOpen ? "אין הודעות פתוחות" : "אין הודעות סגורות"}
              </td>
            </tr>
          ) : (
            messages.map((message, index) => (
              <tr
                key={message.id}
                onClick={() => setSelectedMessageId(message.id)}
                className={`border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800/50"
                }`}
              >
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  {message.email}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {message.title}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                  {message.createdAt}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      statusBadgeConfig[message.status]?.bgClass || statusBadgeConfig.OPEN.bgClass
                    } ${statusBadgeConfig[message.status]?.textClass || statusBadgeConfig.OPEN.textClass}`}
                  >
                    {statusBadgeConfig[message.status]?.label || message.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        {/* Open Messages */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            הודעות פתוחות ({currentOpenMessages.length})
          </h2>
          <MessageTable messages={currentOpenMessages} isOpen={true} />
        </div>

        {/* Closed Messages */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            הודעות סגורות ({currentClosedMessages.length})
          </h2>
          <MessageTable messages={currentClosedMessages} isOpen={false} />
        </div>
      </div>

      {/* Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMessageId(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto w-full shadow-xl dark:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold m-0 text-gray-900 dark:text-white">
                  {selectedMessage.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  מ: <span className="font-semibold text-gray-900 dark:text-white">{selectedMessage.email}</span>
                  {selectedMessage.name && (
                    <>
                      {" "}({selectedMessage.name})
                    </>
                  )}
                </p>
              </div>
              <span className={`inline-block px-4 py-1.5 rounded text-sm font-semibold whitespace-nowrap ${statusBadgeConfig[selectedMessage.status]?.bgClass} ${statusBadgeConfig[selectedMessage.status]?.textClass}`}>
                {statusBadgeConfig[selectedMessage.status]?.label}
              </span>
              <button
                onClick={() => setSelectedMessageId(null)}
                className="bg-none border-none text-2xl cursor-pointer text-gray-500 dark:text-gray-400 p-0 w-8 h-8 flex items-center justify-center hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <p className="rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 mb-4">
                  {error}
                </p>
              )}

              <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-5 text-sm text-gray-600 dark:text-gray-400">
                <p className="my-2">
                  תאריך: <span className="font-semibold text-gray-900 dark:text-white">{selectedMessage.createdAt}</span>
                </p>
                {selectedMessage.closedAt && (
                  <p className="my-2">
                    סגור ב: <span className="font-semibold text-gray-900 dark:text-white">{selectedMessage.closedAt}</span>
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">ההודעה:</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {selectedMessage.description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3 justify-end">
                {selectedMessage.status === "OPEN" ? (
                  <button
                    onClick={handleCloseMessage}
                    disabled={actionInProgress === selectedMessage.id}
                    className="rounded-lg bg-indigo-600 dark:bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {actionInProgress === selectedMessage.id ? "סוגר…" : "סגור הודעה"}
                  </button>
                ) : (
                  <button
                    onClick={handleReopenMessage}
                    disabled={actionInProgress === selectedMessage.id}
                    className="rounded-lg bg-amber-600 dark:bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 dark:hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {actionInProgress === selectedMessage.id ? "פותח…" : "פתח הודעה"}
                  </button>
                )}
                <button
                  onClick={() => setSelectedMessageId(null)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

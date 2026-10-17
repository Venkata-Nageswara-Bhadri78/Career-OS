export function messageStoreKey(id) {
  return id == null ? "" : String(id);
}

export function createEmptyMessageStore() {
  return {
    ids: [],
    byId: {},
    hasMore: false,
    nextCursor: null,
  };
}

function usableMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages.filter((item) => item && item.id != null);
}

function cloneById(store) {
  return { ...store.byId };
}

export function messagesFromStore(store) {
  if (!store?.ids) return [];
  return store.ids.map((id) => store.byId[messageStoreKey(id)]).filter(Boolean);
}

/** Prepend a page in its own order. An id already present is ignored. */
export function prependPage(store, messages) {
  const incoming = usableMessages(messages);
  const byId = cloneById(store);
  const added = [];
  incoming.forEach((message) => {
    const key = messageStoreKey(message.id);
    if (byId[key]) return;
    byId[key] = message;
    added.push(message);
  });
  return {
    ...store,
    ids: [...added.map((item) => item.id), ...store.ids],
    byId,
  };
}

/** Append one message at the end when its id is new. */
export function appendIfNew(store, message) {
  if (!message || message.id == null) return store;
  const key = messageStoreKey(message.id);
  if (store.byId[key]) return store;
  return {
    ...store,
    ids: [...store.ids, message.id],
    byId: { ...store.byId, [key]: message },
  };
}

/**
 * Merge a newest page by id without duplicating, keep already-loaded older
 * rows, and reset hasMore / nextCursor to that page.
 */
export function replaceWithNewest(store, page) {
  const incoming = usableMessages(page?.messages);
  const incomingKeys = new Set(incoming.map((item) => messageStoreKey(item.id)));
  const byId = cloneById(store);
  incoming.forEach((message) => {
    const key = messageStoreKey(message.id);
    if (!byId[key]) byId[key] = message;
  });
  const olderIds = store.ids.filter((id) => !incomingKeys.has(messageStoreKey(id)));
  const ids = [...olderIds, ...incoming.map((item) => item.id)];
  const nextById = {};
  ids.forEach((id) => {
    const key = messageStoreKey(id);
    if (byId[key]) nextById[key] = byId[key];
  });
  const hasMore = page?.hasMore === true;
  const nextCursor = hasMore && typeof page?.nextCursor === "string" && page.nextCursor ? page.nextCursor : null;
  return {
    ids,
    byId: nextById,
    hasMore,
    nextCursor,
  };
}

export function applyHistoryPageCursor(store, page) {
  const hasMore = page?.hasMore === true;
  return {
    ...store,
    hasMore,
    nextCursor: hasMore && typeof page?.nextCursor === "string" && page.nextCursor ? page.nextCursor : null,
  };
}

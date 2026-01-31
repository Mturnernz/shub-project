import { create } from 'zustand';

interface MessagesState {
  /** Total unread count across all conversations */
  totalUnread: number;
  /** Per-booking unread counts */
  unreadByBooking: Record<string, number>;

  setUnreadCounts: (counts: Record<string, number>) => void;
  clearUnreadForBooking: (bookingId: string) => void;
  incrementUnread: (bookingId: string) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  totalUnread: 0,
  unreadByBooking: {},

  setUnreadCounts: (counts) =>
    set({
      unreadByBooking: counts,
      totalUnread: Object.values(counts).reduce((sum, c) => sum + c, 0),
    }),

  clearUnreadForBooking: (bookingId) =>
    set((state) => {
      const updated = { ...state.unreadByBooking };
      delete updated[bookingId];
      return {
        unreadByBooking: updated,
        totalUnread: Object.values(updated).reduce((sum, c) => sum + c, 0),
      };
    }),

  incrementUnread: (bookingId) =>
    set((state) => {
      const updated = {
        ...state.unreadByBooking,
        [bookingId]: (state.unreadByBooking[bookingId] || 0) + 1,
      };
      return {
        unreadByBooking: updated,
        totalUnread: Object.values(updated).reduce((sum, c) => sum + c, 0),
      };
    }),
}));

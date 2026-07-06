import { db } from "@/lib/indexed-db/database";

const now = () => new Date().toISOString();

export const notificationService = {
  async list() {
    return db.notifications.orderBy("occurredAt").reverse().toArray();
  },

  async markAllRead() {
    const timestamp = now();
    const unread = await db.notifications
      .filter((notification) => !notification.readAt)
      .toArray();

    await Promise.all(
      unread.map((notification) =>
        db.notifications.update(notification.id, {
          readAt: timestamp,
          updatedAt: timestamp,
        }),
      ),
    );
  },
};

import { UserModel } from '../models/User';

type PushMessage = {
  to: string;
  sound?: 'default';
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

type ExpoTicket = {
  status: 'ok' | 'error';
  details?: {
    error?: string;
  };
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const isExpoPushToken = (token: string) => /^ExponentPushToken\[.+\]$/.test(token) || /^ExpoPushToken\[.+\]$/.test(token);

export const sendNotificationToUser = async (
  userId: string,
  payload: { title: string; body: string; data?: Record<string, unknown> }
) => {
  const user = await UserModel.findById(userId).select('deviceTokens notificationsEnabled');
  if (!user || !user.notificationsEnabled || !user.deviceTokens.length) {
    return { sent: 0, removedTokens: 0 };
  }

  const validTokens = user.deviceTokens.filter(isExpoPushToken);
  if (!validTokens.length) {
    return { sent: 0, removedTokens: 0 };
  }

  const messages: PushMessage[] = validTokens.map((token) => ({
    to: token,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data,
  }));

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    throw new Error(`Expo push request failed with status ${response.status}`);
  }

  const json = await response.json();
  const tickets: ExpoTicket[] = Array.isArray(json?.data) ? json.data : [];

  const invalidTokens: string[] = [];
  tickets.forEach((ticket, index) => {
    if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
      const token = validTokens[index];
      if (token) invalidTokens.push(token);
    }
  });

  if (invalidTokens.length > 0) {
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { deviceTokens: { $in: invalidTokens } },
    });
  }

  const sent = tickets.filter((ticket) => ticket.status === 'ok').length;
  return { sent, removedTokens: invalidTokens.length };
};

// fetchMessages.ts
import axios from 'axios';

export interface DiscordMessage {
  id: string;
  timestamp: string;
  content: string;
  author: {
    username: string;
  };
  embeds?: Array<{ description?: string }>;
}

export async function fetchMessages(
  token: string,
  channelId: string,
  startDate: string,
  endDate: string,
  timeBuffer: number
): Promise<DiscordMessage[]> {
  const headers = { Authorization: token };
  const url = `https://discord.com/api/v9/channels/${channelId}/messages`;

  let allMessages: DiscordMessage[] = [];

  async function fetchBatch(before?: string): Promise<void> {
    const params: { limit: number; before?: string } = { limit: 100 };
    if (before) {
      params.before = before;
    }
  
    const response = await axios.get<DiscordMessage[]>(url, { headers, params });
    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch messages: ${response.status} - ${response.statusText}`
      );
    }
  
    const batch = response.data;
    if (batch.length === 0) {
      return;
    }
  
    // Check if the oldest message in the batch is before the startDate
    const oldestMessageDate = batch[batch.length - 1].timestamp.slice(0, 10); // "YYYY-MM-DD"
    if (oldestMessageDate < startDate) {
      // console.log(`Stopping fetch: Oldest message date ${oldestMessageDate} is before startDate ${startDate}`);
      return;
    }
  
    // Filter messages in the date range and by author
    const filtered = batch.filter((msg) => {
      const messageDate = msg.timestamp.slice(0, 10); // "YYYY-MM-DD"
      return (
        startDate <= messageDate &&
        messageDate <= endDate &&
        msg.author.username === "Elon Musk (@elonmusk)"
      );
    });
  
    // console.log(`Filtered ${filtered.length} messages`);
    allMessages = [...allMessages, ...filtered];
  
    // Wait for timeBuffer ms before fetching the next batch
    await new Promise((resolve) => setTimeout(resolve, timeBuffer));
  
    // Fetch the next batch, passing in the id of the oldest message in this batch
    const oldestMessageId = batch[batch.length - 1].id;
    await fetchBatch(oldestMessageId);
  }
  
  await fetchBatch();

  return allMessages;
}

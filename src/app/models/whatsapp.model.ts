export interface SendResult {
  to: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface Group {
  groupName: string;
  groupId: string; // Meta group ID OR Twilio conversation SID
}
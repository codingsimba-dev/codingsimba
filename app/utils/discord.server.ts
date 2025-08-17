interface DiscordWebhookPayload {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: string;
  }>;
  username?: string;
  avatar_url?: string;
}

interface DiscordUser {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
}

export class DiscordService {
  private webhookUrl: string;
  private botToken?: string;
  private guildId?: string;

  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || "";
    this.botToken = process.env.DISCORD_BOT_TOKEN;
    this.guildId = process.env.DISCORD_GUILD_ID;
  }

  /**
   * Send a message to Discord via webhook
   */
  async sendWebhookMessage(payload: DiscordWebhookPayload): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn("Discord webhook URL not configured");
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to send Discord webhook:", error);
      return false;
    }
  }

  /**
   * Send a new user notification to Discord
   */
  async notifyNewUser(user: DiscordUser): Promise<boolean> {
    return this.sendWebhookMessage({
      embeds: [
        {
          title: "🎉 New User Joined!",
          description: `**${user.username}** has joined the platform`,
          color: 0x00ff00, // Green
          fields: [
            {
              name: "Username",
              value: user.username,
              inline: true,
            },
            {
              name: "User ID",
              value: user.id,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
      username: "TekBreed Bot",
    });
  }

  /**
   * Send course completion notification
   */
  async notifyCourseCompletion(
    user: DiscordUser,
    courseName: string,
    completionDate: Date,
  ): Promise<boolean> {
    return this.sendWebhookMessage({
      embeds: [
        {
          title: "🎓 Course Completed!",
          description: `**${user.username}** has completed **${courseName}**`,
          color: 0x0099ff, // Blue
          fields: [
            {
              name: "Course",
              value: courseName,
              inline: true,
            },
            {
              name: "Completed",
              value: completionDate.toLocaleDateString(),
              inline: true,
            },
          ],
          timestamp: completionDate.toISOString(),
        },
      ],
      username: "TekBreed Bot",
    });
  }

  /**
   * Send support ticket notification
   */
  async notifySupportTicket(
    user: DiscordUser,
    subject: string,
    priority: "low" | "medium" | "high" = "medium",
  ): Promise<boolean> {
    const colors = {
      low: 0x00ff00, // Green
      medium: 0xffaa00, // Orange
      high: 0xff0000, // Red
    };

    return this.sendWebhookMessage({
      embeds: [
        {
          title: "🆘 New Support Ticket",
          description: `**${user.username}** has created a support ticket`,
          color: colors[priority],
          fields: [
            {
              name: "Subject",
              value: subject,
              inline: false,
            },
            {
              name: "Priority",
              value: priority.toUpperCase(),
              inline: true,
            },
            {
              name: "User",
              value: user.username,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
      username: "CodingSimba Bot",
    });
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(
    title: string,
    message: string,
    type: "info" | "warning" | "error" = "info",
  ): Promise<boolean> {
    const colors = {
      info: 0x0099ff, // Blue
      warning: 0xffaa00, // Orange
      error: 0xff0000, // Red
    };

    const emojis = {
      info: "ℹ️",
      warning: "⚠️",
      error: "❌",
    };

    return this.sendWebhookMessage({
      embeds: [
        {
          title: `${emojis[type]} ${title}`,
          description: message,
          color: colors[type],
          timestamp: new Date().toISOString(),
        },
      ],
      username: "TekBreed Bot",
    });
  }
}

// Export a singleton instance
export const discordService = new DiscordService();

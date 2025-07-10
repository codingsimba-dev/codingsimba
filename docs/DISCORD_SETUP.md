# Discord Integration Setup Guide

This guide will help you configure Discord integration for your CodingSimba platform.

## Overview

Discord integration provides:

- **Community Support**: Real-time help from community members
- **Course Discussions**: Dedicated channels for course-specific Q&A
- **User Notifications**: Automated notifications for platform events
- **Bot Integration**: Automated moderation and user management

## 1. Discord Server Setup

### Create a Discord Server

1. Go to [Discord.com](https://discord.com) and create a new server
2. Name it "CodingSimba Community" or similar
3. Set up the following channels:

#### Essential Channels

```
#general - General community chat
#introductions - New member introductions
#announcements - Platform updates and announcements
#general-support - General help and support
#technical-help - Code and technical issues
#course-help - Course-specific questions
#study-groups - Study group coordination
#showcase - Student projects and achievements
#resources - Learning resources and links
```

#### Optional Channels

```
#random - Off-topic discussions
#memes - Programming memes and humor
#job-board - Job opportunities and career discussions
#events - Community events and meetups
```

### Set Up Roles

Create the following roles with appropriate permissions:

- **Admin** - Full server management
- **Moderator** - Chat moderation and user management
- **Instructor** - Course instructors and mentors
- **Premium Member** - Paid subscribers
- **Student** - Regular community members
- **Bot** - For automated bot accounts

## 2. Discord Bot Setup

### Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "CodingSimba Bot"
4. Go to the "Bot" section and create a bot
5. Copy the bot token (you'll need this for environment variables)

### Bot Permissions

Enable these bot permissions:

- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Manage Messages (for moderation)
- Add Reactions
- Use Slash Commands

### Invite Bot to Server

1. Go to OAuth2 > URL Generator
2. Select "bot" scope
3. Select the permissions above
4. Use the generated URL to invite the bot to your server

## 3. Environment Variables

Add these variables to your `.env` file:

```env
# Discord Configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN
DISCORD_GUILD_ID=YOUR_SERVER_ID
DISCORD_CLIENT_ID=YOUR_CLIENT_ID
DISCORD_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

### Getting These Values

#### Webhook URL

1. In your Discord server, go to Server Settings > Integrations
2. Click "Create Webhook"
3. Choose a channel (e.g., #announcements)
4. Copy the webhook URL

#### Server ID (Guild ID)

1. Enable Developer Mode in Discord (User Settings > Advanced)
2. Right-click your server name
3. Click "Copy Server ID"

#### Client ID and Secret

1. Go to your Discord application in the Developer Portal
2. Copy the Client ID from the General Information page
3. Go to OAuth2 > General to find the Client Secret

## 4. Discord Bot Features

### User Verification

The bot can automatically verify users who sign up on your platform:

```typescript
// Example: Verify user when they sign up
await discordService.verifyUser({
  userId: user.id,
  username: user.username,
  email: user.email,
});
```

### Course Notifications

Send notifications when new content is available:

```typescript
// Example: Notify about new course
await discordService.notifyNewCourse({
  courseName: "Advanced React",
  instructor: "John Doe",
  description: "Learn advanced React patterns",
});
```

### Support Ticket Integration

Create Discord channels for support tickets:

```typescript
// Example: Create support ticket
await discordService.createSupportTicket({
  userId: user.id,
  subject: "Login issues",
  priority: "high",
  description: "Unable to log into platform",
});
```

## 5. Discord Webhook Integration

### Available Webhook Events

The platform can send these notifications to Discord:

1. **New User Registration**

   - Welcome message
   - User verification
   - Role assignment

2. **Course Events**

   - New course published
   - Course completion
   - Lesson updates

3. **Support Events**

   - New support ticket
   - Ticket status updates
   - Resolution notifications

4. **Community Events**
   - New achievements
   - Study group formation
   - Community milestones

### Customizing Webhook Messages

You can customize the appearance of webhook messages by modifying the `DiscordService` class in `app/utils/discord.server.ts`.

## 6. Discord OAuth Integration

### User Authentication with Discord

Users can sign in using their Discord account:

1. Set up OAuth2 redirect URLs in your Discord application
2. Configure the OAuth flow in your authentication system
3. Handle user data and role assignment

### Example OAuth Configuration

```typescript
// In your auth provider configuration
const discordProvider = {
  id: "discord",
  name: "Discord",
  type: "oauth",
  authorization: {
    url: "https://discord.com/api/oauth2/authorize",
    params: {
      scope: "identify email guilds.join",
      response_type: "code",
    },
  },
  token: "https://discord.com/api/oauth2/token",
  userinfo: "https://discord.com/api/users/@me",
  profile(profile) {
    return {
      id: profile.id,
      name: profile.username,
      email: profile.email,
      image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
    };
  },
};
```

## 7. Discord Bot Commands

### Slash Commands

Set up these useful slash commands:

- `/help` - Show available commands
- `/profile` - Show user's platform profile
- `/courses` - List available courses
- `/progress` - Show learning progress
- `/support` - Create a support ticket
- `/study-group` - Create or join a study group

### Example Command Handler

```typescript
// Example slash command handler
app.command("profile", async (interaction) => {
  const userId = interaction.user.id;
  const userProfile = await getUserProfile(userId);

  await interaction.reply({
    embeds: [
      {
        title: `${interaction.user.username}'s Profile`,
        fields: [
          {
            name: "Courses Completed",
            value: userProfile.coursesCompleted.toString(),
          },
          { name: "Current Streak", value: userProfile.streak.toString() },
          { name: "Total Points", value: userProfile.points.toString() },
        ],
      },
    ],
  });
});
```

## 8. Monitoring and Analytics

### Discord Analytics

Track these metrics:

- Member growth rate
- Message activity
- Support ticket resolution time
- Course completion rates
- User engagement levels

### Integration with Platform Analytics

Connect Discord activity with your platform analytics to understand:

- Which Discord users are most active on the platform
- How Discord engagement correlates with course completion
- Support ticket patterns and resolution effectiveness

## 9. Security and Moderation

### Bot Moderation Features

- Auto-moderation for inappropriate content
- Spam detection and prevention
- User verification and role management
- Support ticket escalation

### Privacy Considerations

- Ensure GDPR compliance for user data
- Implement proper data retention policies
- Provide clear privacy notices
- Allow users to opt-out of Discord integration

## 10. Testing Your Integration

### Test Checklist

- [ ] Bot joins server successfully
- [ ] Webhook messages are delivered
- [ ] User verification works
- [ ] Support ticket creation functions
- [ ] Course notifications are sent
- [ ] OAuth login works (if implemented)
- [ ] Slash commands respond correctly
- [ ] Role assignment works properly

### Debugging Tips

1. Check bot permissions in Discord
2. Verify webhook URLs are correct
3. Monitor bot logs for errors
4. Test with a development Discord server first
5. Use Discord's developer tools to inspect API responses

## 11. Deployment

### Production Checklist

- [ ] Use production Discord application
- [ ] Set up proper environment variables
- [ ] Configure webhook security
- [ ] Set up monitoring and logging
- [ ] Test all integrations thoroughly
- [ ] Document any custom configurations

### Environment-Specific Setup

- **Development**: Use a test Discord server
- **Staging**: Use a staging Discord server
- **Production**: Use the main community Discord server

## Support

If you need help with Discord integration:

1. Check the Discord Developer Documentation
2. Review the Discord API documentation
3. Join Discord's developer community
4. Contact the platform support team

## Resources

- [Discord Developer Portal](https://discord.com/developers)
- [Discord API Documentation](https://discord.com/developers/docs)
- [Discord.js Documentation](https://discord.js.org/)
- [Discord Webhook Guide](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

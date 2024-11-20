# Recall-Zapier

## 🎩 Introduction

Recall-Zapier serves as a bridge between google meets and various applications, leveraging [Recall AI](https://www.recall.ai/) and [OpenAI](https://openai.com/api/) APIs

It enables users to create custom no-code bots to automate tasks and streamline workflows during google meets

The cool thing is you can speak to it in natural language, and it will trigger actions in other apps

Just ask [bot name] to do the thing and thank him for his time (the command structure) and they will take care of the rest!

## 🧩 Features

For Developers:

- **Create your own app/integration**: Create a trigger to your app that is automatically activated when asking the bot
- **Communicate with in the call through the bot**: Message in-chat follow-ups and updates as needed

For Users:

- **No-Code Bot Creation**: Easily set up a bot by selecting which features you want, built by our team and the community
- **Voice-Activated Triggers**: Activate the bot and execute commands using natural language during your calls
- **User-Friendly Interface**: Build a bot in as little as 60 seconds, then make them join your next call with a click of a button

Current Integrations:

- **Google Docs**: Create a new google doc for the team to join (reality: posts a link to docs.new 🥲)
- **Slack Ping**: Ping a slack channel to notify the team to join the call (reality: pings discord because I don't have slack 😭)

Note: These integrations are just POCs and can pretty quickly be improved to become fully functional if needed.

## ⚙️ API

We currently have the following APIs:

- POST `/api/v1/bot/[botId]/message` - Send a message to the chat in live calls
  - body:
    - `message`: `string` - The message to send to the chat

## 🏗 Architecture

![alt text](image.png)

#### Architecture Description

This architecture diagram illustrates the flow of the Recall-Zapier system, highlighting how the Next.js client and server interact with external APIs, webhooks, and platforms like Google Meet to enable its functionality.

---

###### **Next.js Client**

1. **Dashboard**:

   - Users start by creating standalone "features" called apps (similar to Zapier integrations).
   - These features are then grouped into a collection to form bot templates which bots are deployed from.

2. **Bot Deployment**:
   - Users send a bot to a meeting.

---

###### **Next.js Server**

1. **App Creation**:

   - The server handles requests from the client to create apps (feature collections).

2. **Bot Template Management**:

   - Templates are created by linking external apps.
   - The server creates bots from the bot template

3. **Bot Management**:

   - The server manages the meeting bot's (separate from the bot in the bot template) lifecycle, including joining meetings and sending messages.

4. **Webhook Listeners**:

   - Recall communicates to the server via webhooks, posting live transcriptions
   - Server parses the transcriptions and derives commands/actions through OpenAI's GPT
   - Server triggers the appropriate actions according to which app commands were executed

5. **Webhook Emitters**:

   - The server emits webhooks to the developer's servers when the apps' commands are executed

---

###### **Recall**

1. **Live Interaction**:

   - Recall processes the live meeting data, including transcriptions and commands.
   - The bot communicates with third-party services for transcription and natural language processing:
     - **Assembly AI**: Used for transcribing the meeting conversation.
     - **OpenAI GPT**: Processes transcripts, parses commands, and fills in missing variables for executing features.

---

###### **Flow Summary**

- The user configures bots via the Next.js client and server.
- Bots join Google Meet meetings, interact in real-time, and leverage AI services for transcription and command execution.
- Results are communicated back to the meeting and, optionally, to developer-defined webhooks.

This design integrates Google Meet with Recall and OpenAI, enabling powerful, real-time automation through voice commands via a no-code interface.

Feel free to explore the capabilities of Recall-Zapier and transform the way you interact in your Google Meet sessions!

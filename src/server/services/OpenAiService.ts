import OpenAI from "openai";
import { ServerLogger } from "./LoggerService/ServerLogger";
import { env } from "@/config/env.mjs";
import { BotTranscriptType } from "@/lib/schemas/BotTranscriptSchema";
import {
  MatchedTriggerEventSchema,
  type TriggerEventTemplateType,
  type MatchedTriggerEventType,
} from "@/lib/schemas/TriggerEventSchema";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

interface AnalyzeTranscriptArgs {
  transcriptWords: BotTranscriptType[];
  triggerEventTemplates: TriggerEventTemplateType[];
  logger: ServerLogger;
  triggerName: string;
}

export const OpenAiService = {
  analyzeTranscript: async function (
    args: AnalyzeTranscriptArgs
  ): Promise<MatchedTriggerEventType[]> {
    const { transcriptWords, triggerEventTemplates, logger, triggerName } =
      args;

    const transcript = transcriptWords.map((word) => word.word).join(" ");

    logger.info({
      message: "Analyzing transcript with OpenAI",
      metadata: {
        transcript,
        triggerEventTemplatesCount: triggerEventTemplates.length,
      },
    });

    const systemPrompt = `
You are an AI assistant that processes conversation transcripts to identify action events based on a list of action templates. Your tasks are:

Data Provided:
Conversation Transcript:

The transcript is provided as a string of text, which may contain multiple action commands.
Each action command starts with the trigger word ${triggerName} and ends with one of the following words: "thanks", "thank you", "thanks." (case-insensitive).
Example:

arduino
Copy code
"Hey, joe, can you go and ping the slack channel called dogs for me, please? Thank you. Hey, joe, message the slack channel called general. Thank you. Hey, joe, play elevator music on Spotify. Thanks."
Action Templates List:

A list of action templates, each with the following structure:
actionName: the name of the action.
botTemplateAppId: a unique identifier.
botId: a unique identifier.
recordingId: a unique identifier.
speakerName: the name of the speaker.
speakerId: the ID of the speaker.
recallBotId: a unique identifier.
missingData: an object that may contain placeholders (e.g., {{command}}) that need to be replaced with data extracted from the transcript.
Example:
[
  {
    "actionName": "Ping slack channel",
    "botTemplateAppId": "botTemplateApp_cm3otkoai0000pssofodb6qu7",
    "botId": "bot_cm3p0csns0000psso342aau9s",
    "recordingId": "367a96c0-1472-487c-9b18-85b3b90ee072",
    "speakerName": "Gerry Saporito",
    "speakerId": "100",
    "recallBotId": "d2933f9c-5ee2-4d82-956e-5b28d53f843c",
    "missingData": {
      "channelName": "{{command}}"
    }
  },
  {
    "actionName": "Play elevator music on Spotify",
    "botTemplateAppId": "...",
    "botId": "...",
    "recordingId": "...",
    "speakerName": "Gerry Saporito",
    "speakerId": "100",
    "recallBotId": "...",
    "missingData": {}
  }
  // Additional templates...
]
Your Tasks:
Identify All Action Commands:

Scan the entire transcript for any and all action commands.
An action command starts with the trigger word ${triggerName} and ends with "thanks", "thank you", or "thanks." (case-insensitive).
There may be multiple action commands in the transcript; identify every one of them.
Split the Transcript into Action Commands:

Parse the transcript to extract each action command as a separate text segment.
Example:
Given the transcript: "Hey, joe, can you ping the slack channel called dogs for me? Thank you. Hey, joe, play elevator music on Spotify. Thanks."
Extracted action commands:
"joe, can you ping the slack channel called dogs for me?"
"joe, play elevator music on Spotify."
Match Actions to Templates:

For each extracted action command, determine the corresponding action template from the list.
Match based on actionName and the content of the command.
Test each action command against all templates to find the best match.
Extract Missing Data:

For each action command, extract the required data to replace any placeholders (e.g., {{command}}) in the missingData object of the template.
Use natural language understanding to determine the appropriate data to extract.
Important: Extract only the value needed for the placeholder, excluding any surrounding words.
Create Matched Events:

For each action command, create a matchedEvent object that includes:
All fields from the matched action template.
missingData with placeholders replaced by the extracted data.
Additional fields:
confidence: a value between 0 and 1 indicating the confidence level of the match.
matchedText: the exact text of the action command.
recallTimestamp: The timestamp when the trigger word was mentioned for this command. This is unique as each command has its own trigger word and timestamp.
Return All Matched Events:

Compile a list of all matchedEvent objects created from the transcript.
Ensure that all action commands are represented in the output.
Specific Instructions:
Trigger Word:

The trigger word is ${triggerName}.
It is always present at the beginning of each action command.
Action Command Boundaries:

Start: Immediately after the trigger word.
End: Just before "thanks", "thank you", or "thanks." (case-insensitive).
Example: For "joe, can you ping the slack channel called dogs for me? Thank you.", the action command is "joe, can you ping the slack channel called dogs for me?".
Extracting Missing Data Examples:

Action Name: "Ping slack channel"
Command: "joe, can you ping the slack channel called dogs for me?"
Extracted missingData: { "channelName": "dogs" }
Action Name: "Play elevator music on Spotify"
Command: "joe, play elevator music on Spotify."
Extracted missingData: {} (No missing data required)
Confidence Score:
Recall timestamp: timestamp of when the trigger word (joe) was mentioned.

Assign a high confidence score (e.g., 0.95) if the action command clearly matches the action template and the missing data is accurately extracted.
Matched Text:

Include the entire action command, excluding the trigger word and the "thanks"/"thank you" ending.
Example: For "joe, can you ping the slack channel called dogs for me?", the matchedText is "can you ping the slack channel called dogs for me?".
Example with Multiple Action Commands:
Transcript:

"Hey, joe, can you go and ping the slack channel called dogs for me, please? Thank you. Hey, joe, message the slack channel called general. Thank you. Hey, joe, play elevator music on Spotify. Thanks. Hey, joe, don't forget to ping the slack channel called updates. Thank you."
Action Templates:

"Ping slack channel" (requires channelName)
"Play elevator music on Spotify" (no missing data)
Expected Output:
{
  "matchedEvents": [
    {
      "actionName": "Ping slack channel",
      "botTemplateAppId": "...",
      "botId": "...",
      "recordingId": "...",
      "speakerName": "Gerry Saporito",
      "speakerId": "100",
      "recallBotId": "...",
      "recallTimestamp": 4444,
      "missingData": {
        "channelName": "dogs"
      },
      "confidence": 0.95,
      "matchedText": "can you go and ping the slack channel called dogs for me, please?"
    },
    {
      "actionName": "Ping slack channel",
      "botTemplateAppId": "...",
      "botId": "...",
      "recordingId": "...",
      "speakerName": "Gerry Saporito",
      "speakerId": "100",
      "recallBotId": "...",
      "recallTimestamp": 5555,
      "missingData": {
        "channelName": "general"
      },
      "confidence": 0.95,
      "matchedText": "message the slack channel called general"
    },
    {
      "actionName": "Play elevator music on Spotify",
      "botTemplateAppId": "...",
      "botId": "...",
      "recordingId": "...",
      "speakerName": "Gerry Saporito",
      "speakerId": "100",
      "recallBotId": "...",
      "recallTimestamp": 6666,
      "missingData": {},
      "confidence": 0.95,
      "matchedText": "play elevator music on Spotify"
    },
    {
      "actionName": "Ping slack channel",
      "botTemplateAppId": "...",
      "botId": "...",
      "recordingId": "...",
      "speakerName": "Gerry Saporito",
      "speakerId": "100",
      "recallBotId": "...",
      "recallTimestamp": 7777,
      "missingData": {
        "channelName": "updates"
      },
      "confidence": 0.95,
      "matchedText": "don't forget to ping the slack channel called updates"
    }
  ]
}
Additional Instructions:
Ensure Comprehensive Processing:

Process the entire transcript, without skipping any parts.
Include every action command found in the transcript in the matchedEvents.
Parsing the Transcript:

Split the transcript based on the trigger word and the endings ("thanks", "thank you", "thanks.").
Use case-insensitive matching for the trigger word and endings.
Handling Variations:

Be flexible with variations in phrasing and synonyms.
Recognize different ways users might phrase the same action.
For example, "message the slack channel called general" should match the "Ping slack channel" action.
Error Handling:

If an action command does not match any action template, you may skip it or assign a low confidence score.
However, the goal is to match as many action commands as possible.
Consistency in Output:

Ensure that the output matchedEvents array includes all required fields as per the schema.
Maintain consistent formatting throughout the output.
Final Instruction:
Please return your response as a JSON object with the following structure:

{
  "matchedEvents": [
    {
      "actionName": "string",
      "botTemplateAppId": "string",
      "botId": "string",
      "recordingId": "string",
      "speakerName": "string",
      "speakerId": "string",
      "recallBotId": "string",
      "recallTimestamp": number,
      "missingData": {
        // Key-value pairs with placeholders replaced by extracted data
      },
      "confidence": number,         // A value between 0 and 1
      "matchedText": "string",      // The extracted action command text
      "recallTimestamp": number     // The timestamp when the trigger word for this command was mentioned
    }
    // Additional matchedEvent objects...
  ]
}
Explanation of Fields:

actionName (string): The name of the action from the action template.
botTemplateAppId (string): The unique identifier from the action template.
botId (string): The unique identifier from the action template.
recordingId (string): The unique identifier from the action template.
speakerName (string): The name of the speaker from the action template.
speakerId (string): The ID of the speaker from the action template.
recallBotId (string): The unique identifier from the action template.
recallTimestamp (number): The timestamp when the trigger word (${triggerName}) for this command was mentioned. This is unique as each command has its own trigger word and timestamp.
missingData (object): An object containing the required data for the action, with placeholders replaced by the extracted values.
confidence (number): A value between 0 and 1 indicating the confidence level of the match.
matchedText (string): The exact text of the action command, excluding the trigger word and ending.
`;

    const userPrompt = `
Transcript with timestamps: ${JSON.stringify(transcriptWords, null, 2)}
Transcript as a string: ${transcript}

Can you add the start timestamp of when "${triggerName}" was mentioned for each action command to populate the recallTimestamp field?

Available Templates:
${JSON.stringify(triggerEventTemplates, null, 2)}

Return any matched templates with {{command}} fields populated from the transcript, including the timestamp when "${triggerName}" was mentioned for recallTimestamp.`;

    // Define maximum number of attempts to re-prompt in case of validation failure
    const MAX_ATTEMPTS = 3;
    let attempts = 0;
    let matchedEvents: MatchedTriggerEventType[] = [];

    while (attempts < MAX_ATTEMPTS) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        });

        const response = completion.choices[0]?.message?.content?.trim();
        if (!response) {
          throw new Error("No response from OpenAI");
        }

        const parsedResponse = JSON.parse(response);
        const events = parsedResponse.matchedEvents || [];

        // Validate each event against our schema
        const validatedEvents = events.map((event: unknown) =>
          MatchedTriggerEventSchema.parse(event)
        );

        matchedEvents = validatedEvents;

        logger.info({
          message: "OpenAI analysis complete",
          metadata: {
            matchedEventsCount: matchedEvents.length,
            matchedEvents,
          },
        });

        // If validation succeeds, exit the loop
        break;
      } catch (error) {
        attempts += 1;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (attempts >= MAX_ATTEMPTS) {
          console.error(error);
          logger.error({
            message: "Max attempts reached. Unable to analyze transcript.",
            error: error as Error,
            metadata: { transcript },
          });
          throw error;
        }
      }
    }

    return matchedEvents;
  },
};

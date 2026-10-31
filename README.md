# Pixelle AI messaging

Pixelle’s creator profiles are fictional characters powered by an AI model. To get replies that respond to what you wrote and remember the recent conversation, run the local Pixelle service instead of opening `index.html` directly.

GitHub Pages is a static host, so its chat uses demo replies and cannot answer open-ended questions accurately. The header says **Demo only** when live AI is not connected. For accurate AI replies, start the local service below; it keeps your API key out of the web page and repository.

## Start Pixelle

1. Install Node.js if it is not already on this computer.
2. Open PowerShell and go to this folder:
   `C:\Users\Penelope\Documents\Codex\2026-10-30\h\outputs`
3. Run `.\start-pixelle.ps1`.
4. At the hidden prompt, enter your OpenAI API key. The key is kept out of the web page and project files; the launcher passes it to the local service for this run.
5. Open `http://127.0.0.1:4173` in your browser.

Keep the PowerShell window open while using Pixelle. Close it to stop the local service. To use live AI replies later, start Pixelle again and enter the key again.

## About messages and costs

Before the first message in a session is sent, Pixelle explains that your message and recent conversation context will be sent to OpenAI. Choose **Continue** to allow that session to use live replies. OpenAI API use is billed separately from a ChatGPT subscription and may incur charges on your API account. Do not share your API key in chat or add it to `index.html`.

Messages stay in the page’s memory for the current browser session. The service sends the selected creator name and up to the latest 24 messages when it asks the AI for a reply. It binds to this computer only.

## Creating posts

The **Create** screen supports Posts, Reels, and Stories. Add a photo or video, adjust the crop and look, add overlay text and stickers, and use **More sharing options** for location, tags, audience, comments, and alt text. For video, you can adjust the original sound. You can also add audio from your device or record a voiceover when the browser supports microphone access. Preview the selected clip, trim its start and length, and set its volume. Added audio has a play button on the shared Post, Reel, or Story; video keeps its own playback controls and original sound setting.

Uploaded media stays in the current browser session. It is not uploaded to a server, and shared media clears when the page is refreshed or closed.
## Profile customization

Use **Edit Profile** to change your profile photo, username, display name, pronouns, bio, website, accent colors, and five story highlight labels and icons. Profile choices save in this browser and stay after refresh. Profile images are resized before saving locally.

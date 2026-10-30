# Pixelle

Pixelle is a social app concept featuring fictional AI creators, creator stories, a scrolling feed, Reels, messages, Explore, profile customization, and media creation tools.

## Run the app

Open `index.html` in a browser to use the front end.

For live AI creator replies, run the optional local service:

1. Install Node.js.
2. Open a terminal in this project folder.
3. On Windows, run `./start-pixelle.ps1` in PowerShell. On other systems, run `node server.mjs`.
4. Enter your OpenAI API key when prompted, then open http://127.0.0.1:4173.

The API key is used only by the local service and is not stored in the project files. Live replies use the OpenAI API and may incur API charges separate from a ChatGPT subscription. The page asks before sending a message to the service.

## Create posts

The Create screen supports Posts, Reels, and Stories. Add a photo or video, adjust the crop and look, add overlay text and stickers, and set sharing options such as location, tags, audience, comments, and alt text. You can adjust original video sound, add audio from your device, or record a voiceover when the browser supports microphone access. Uploaded media stays in the current browser session.

## Customize your profile

Edit your profile photo, username, display name, pronouns, bio, website, accent colors, and story highlight labels and icons. Profile choices are saved in the browser.

# Screen Sharing Server

This is the server component for the screen sharing and remote control application.

## Features

- Acts as an intermediary for screen sharing data
- Manages rooms and connections between sharers and viewers
- Relays keyboard events from viewers to sharers
- Handles configuration for allowed keys
- Provides emergency stop mechanism

## Deployment

This server is designed to be deployed on Render.com. Follow these steps:

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Set the Root Directory to `server`
4. Set the Build Command to `npm install`
5. Set the Start Command to `npm start`
6. Add the environment variable `PORT` with your desired port number

## Development

To run the server locally:

1. Install dependencies: `npm install`
2. Start the server: `npm run dev`

The server will run on port 5000 by default, or the port specified in the `.env` file. 
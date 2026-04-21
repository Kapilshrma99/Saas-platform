# Owner Mobile App

This Expo app lets the website owner log in and receive live booking notifications over WebSockets.

## Setup

1. Run `npm install` inside `owner-mobile`.
2. Set your backend URL in `App.js` by editing `API_BASE_URL`.
3. Start the app with `npm start`.

## Notes

- Use the same owner email and password created in the web dashboard.
- The app loads the last 50 notifications from `/api/notifications`.
- New bookings arrive instantly through `socket.io`.

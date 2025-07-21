# RoastMeDaddy

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/cainebenoy-gmailcoms-projects/v0-javascript-api-example)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/9D2tINHTwTk)

## Overview

RoastMeDaddy is an AI-powered application designed to deliver personalized and escalating roasts. It features various sections to interact with the AI, including:

*   **Roast Gauntlet**: A chat-based AI that insults the user, escalating in intensity with each message.
*   **Personality Demolition**: A quiz with randomized, inhumane questions designed to gather data for devastating personal roasts.
*   **Profile Roast**: Integrates with GitHub to fetch profile details and deliver tailored roasts based on real developer data.
*   **Fashion Roast**: (If implemented) Allows users to upload images for AI-powered fashion critiques.
*   **Typing Test Roast**: (If implemented) Roasts users based on their typing performance.

This project leverages the Gemini API for AI capabilities and is built with Next.js, ensuring a fast and responsive user experience.

## Features

*   **Dynamic Roasting**: AI-generated insults that adapt and escalate.
*   **Personalized Attacks**: Roasts based on quiz answers and GitHub profile data.
*   **Responsive Design**: Optimized for various screen sizes.
*   **Secure API Handling**: GitHub token is securely handled on the server-side.
*   **Rate Limit Resilience**: Includes a retry mechanism for Gemini API calls to handle temporary rate limits.

## Deployment

This project is automatically synced with your [v0.dev](https://v0.dev) deployments. Any changes you make to your deployed app on v0.dev will be automatically pushed to this repository.

Your project is live at:

**[https://vercel.com/cainebenoy-gmailcoms-projects/v0-javascript-api-example](https://vercel.com/cainebenoy-gmailcoms-projects/v0-javascript-api-example)**

To deploy your own instance:

1.  **Clone this repository**:
    \`\`\`bash
    git clone https://github.com/cainebenoy-gmailcoms-projects/RoastMeDaddy-ss.git
    cd RoastMeDaddy-ss
    \`\`\`
2.  **Install dependencies**:
    \`\`\`bash
    npm install
    \`\`\`
3.  **Set up Environment Variables**:
    Create a `.env.local` file in the root of your project and add your API keys:
    \`\`\`
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    GITHUB_TOKEN="YOUR_GITHUB_PERSONAL_ACCESS_TOKEN" # Optional, for enhanced GitHub roasts
    \`\`\`
    *   You can get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   A GitHub Personal Access Token (PAT) can be generated in your GitHub settings (Developer settings > Personal access tokens). It's optional; the app will fall back to basic GitHub data without it.
4.  **Run the development server**:
    \`\`\`bash
    npm run dev
    \`\`\`
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.
5.  **Deploy to Vercel**:
    You can deploy this project directly to Vercel. Ensure your environment variables are configured in your Vercel project settings.

## How It Works

This application is built using Next.js with the App Router.

*   **AI Integration**: Utilizes the Gemini API for generating roasts. API calls are handled securely on the server-side.
*   **Server Actions**: Sensitive operations, like fetching GitHub data with a token, are performed using Next.js Server Actions to prevent exposing sensitive environment variables to the client.
*   **Component Structure**: The application is organized into various React components, each responsible for a specific roasting section (e.g., `RoastGauntletSection`, `PersonalityDemolitionSection`, `ProfileRoastSection`).
*   **Styling**: Uses Tailwind CSS and Shadcn UI components for a modern and responsive design.

## Contributing

Feel free to fork this repository and contribute!

## License

This project is open-source and available under the MIT License.


[![💻 Built at TinkerSpace](https://img.shields.io/badge/Built%20at-TinkerSpace-blueviolet?style=for-the-badge&label=%F0%9F%92%BBBuilt%20at&labelColor=turquoise&color=white)](https://tinkerhub.org/tinkerspace)

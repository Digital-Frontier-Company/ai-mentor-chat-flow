
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3bc5ee61-7ae8-428d-8c82-e6cd397bbefa

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3bc5ee61-7ae8-428d-8c82-e6cd397bbefa) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Configuration

This project uses a centralized configuration approach with the main configuration file at `src/config/index.ts`. 
This allows for consistent configuration across both client-side code and serverless edge functions.

If you prefer using environment variables:
1. Modify the config file to read from environment variables
2. Create a local `.env` file based on `.env.example`
3. Add your actual credentials to the `.env` file

## Security Best Practices

- Only use the anon key in the client-side code
- Keep the service role key restricted to server-side edge functions
- Always enable Row Level Security (RLS) on Supabase tables
- Use policies to control data access at the row level

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3bc5ee61-7ae8-428d-8c82-e6cd397bbefa) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)


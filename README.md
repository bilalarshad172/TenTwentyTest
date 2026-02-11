This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
Used next-auth for creating the session and API folder is protected with the next auth handler
User can only make API calls if he is authenticated. 
Inbuilt Json Database in the data folder. 
Data is updated, retrieved and delected sucesfully. 
Dynamic routing for weekly timesheets. 
Used Ant Design components library for its components.
Used Zustand as a store for client side Data sharing across components
.env Credentials as follow

NEXTAUTH_SECRET=your-long-random-secret
NEXTAUTH_URL=http://localhost:3000

Download the codebase from here. Then run 

npm i

After that

```bash
npm run dev

```
The login credentials will be provided on the login screen.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.







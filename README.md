# Rock of Ages Client

Rock of Ages is a React application created with Vite. 
It is a simple CRUD application that allows users to:
- Login or Register
- View all rocks
- Collect a rock
- View their rocks
- Delete a rock
- Logout

## Getting Started

1. Clone this repository.
2. `cd` to the project directory.
3. Run `npm install`
4. Run `npm run dev`

You should see output in your terminal like this.

```txt
VITE v4.4.9  ready in 3531 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

Open the URL that you see in your browser.

## Testing the application

1. Click on "Not a member yet?" and create an account 
    >do not use a real email or password here, just make something up
2. Click on "All Rocks" in the nav bar. You should see a list of rocks from all the users' collections. 
3. Click on "Collect a Rock". Create a rock for your collection. You should see your newly created rock in the "All Rocks" list.
4. Click on "My Rocks". You should see your newly added rock, and only your rocks.
5. Click "logout". You should successfully logout of the application and be redirected back to the Login page.  

## The API

This application is designed to interact with a Rock of Ages API. By default, it sends requests to the Nashville Software School’s deployed instance of the API. The base URL for the API is defined in the .env file using a `VITE_API_URL` environment variable, which is accessed in the application's components via import.meta.env.

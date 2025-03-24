# CS4218 G16 Ecom Project

## Prerequisites
Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 22.13.1)

## Environment Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/cs4218/cs4218-2420-ecom-project-team16.git
   cd cs4218-2420-ecom-project-team16
   ```

2. Install dependencies in both frontend and backend folder:
   From root directory, install backend dependencies:
   ```sh
   npm install  
   ```
   Move to frontend directory and install frontend dependencies:
   ```sh
   cd client
   npm install
   ```

3. Set up environment variables:
   Overwrite the .env file in the code with the one in Canvas .zip file

## Running the Application

To start the application locally:
```sh
npm run dev
```

## Running Tests

Run frontend unit and integration tests with:
```sh
npm run test:frontend
```

Run backend unit and integration tests with:
```sh
npm run test:backend
```

Run UI tests with:
```sh
npx playwright test
```
As some of the tests are flaky, they can be tested in isolation for better performance and much higher chance to pass. 
You can choose to run the test in isolation with:
```sh
npx playwright test
```

## Continuous Integration

Our project is set up with GitHub Actions for continuous integration. Below is the URL of our GitHub workflow: </br>
https://github.com/cs4218/cs4218-2420-ecom-project-team16/actions/runs/13235290592/job/36938980718




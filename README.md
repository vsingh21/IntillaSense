# IntillaSense

<h1>Pictures</h1>

<p align="center">
  <img width="1920" alt="Screenshot 2025-03-02 at 6 28 43 AM" src="https://github.com/user-attachments/assets/4875bf81-b31d-4db5-8c7b-15ba67d37df9" />
  <img width="961" alt="Screenshot 2025-03-02 at 6 28 23 AM" src="https://github.com/user-attachments/assets/c666e00d-ad58-4519-b927-f2c73a70bf0f" />
</p>

<h1>IntillaSense - AI-Powered, data-driven farming insights <i>from the ground up</i></h1>

## Inspiration
Farming is integral to life, and AI is the perfect tool to empower farmers to make important, data-driven decisions about their fields and how to care for them. IntillaSense utilizes the power of modern AI technology combined with rich datasets, enabling farmers to make cost-centric decisions about their farming practices.

## AI-Powered Agricultural Planning Optimization With AGCO Track
Our solution fully addresses the problem statement by providing farmers with specific tillage recommendations tailored to each field using LLMs and multimodal AI. IntillaSense processes comprehensive farm data—including geographic location, crop history, soil conditions, climate trends, and available equipment—to generate precise, data-driven insights.

Each recommendation includes:
- Field-specific tillage strategies based on real-world data
- A cost estimate for the recommended approach
- A clear explanation of why the chosen tillage method is optimal

To meet the user-facing UI/UX requirement, IntillaSense features a multimodal interface that supports text, voice, and image, allowing farmers to interact naturally and access insights effortlessly.

## What it does
IntillaSense is trained on comprehensive datasets of two farms, including their geographic locations, crop planting history, historical temperature, precipitation, and soil data, as well as the equipment available so that it is best equipped to make important, data-driven decisions and answer any and all questions the farmer may have about the past, present, or future.
## How we built it
Bootstrapped with Flask and React, IntillaSense harnesses OpenAI's state-of-the-art 4o model to make informed, reliable, and repeatable decisions. Utilizing proprietary request and response schemas, IntillaSense ensures that farmers get the data they need each and every time.
## Challenges we ran into
* Not all AI models are compatible with multi-modal input, requiring the use of multiple API calls to fully analyze these types of user requests
* Maintaining context throughout a series API requests is non-trivial and requires a complex UI and Backend

## Accomplishments that we're proud of
* IntillaSense is fully multi-modal, supporting text, voice (real-time speech-to-text), and image input.
* IntillaSense compiles context data from multiple independent sources not easily retrievable via API and accomplishes this all with a $0 development cost

## What we learned
* We gained a great appreciation for the multitude of factors a farmer must weigh when considering their method of tillage for the upcoming season
* We learned how to quickly bootstrap a project and rapidly iterate toward a shared vision

## What's next for IntillaSense
IntillaSense can be easily expanded to take in data about more farms and an even wider range of factors, allowing it to help even more farmers and make a greater impact on this important community.


<h1>Setup</h1>

In the `/intillasense` directory, you can run:

### `npm install`

Installs all required dependencies for the React app

In the `/api` directory you can run 
### `python -m venv venv`

Creates a virtual python environment

### `source venv/bin/activate`

Activates the python virtual environment

### `pip install -r ./src/requirements.txt`

Installs all required python modules

In the `/api/src` directory

### `.env`

You need to create a .env and define these two variables `API_KEY`,`AZURE_OPENAI_ENDPOINT`

<h1>Run</h1>

In the `/intillasense` directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

In the `/intillasense` directory, in a different terminal you can run:

### `yarn start-api`

Runs the flask api in the development mode.\
Open [http://localhost:5000](http://localhost:5000) to access it directly in your browser.

The page will reload when you make changes.\
You may also see any errors in the console.


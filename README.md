## twovotes
 **twovotes** is like a voting application where users can rate two pictures by reacting on the one they preferred.
 See the live app at [https://twovotes.herokuapp.com](https://twovotes.herokuapp.com)
### What a User can do with the app
- User can sign up and Sign in to the application
- user can post the two pictures and wait for other users to rate them.
- User can rate other pictures posted by other users
- User can update his profile
- User can sign out of the application

### Technology Stack used
- PassportJS - for the session based authentication
- NodeJS
- MongoDB NoSQL database
- ExpressJS
- Bootstrap 3
- jQuery
- EJS templating engine

### Installation
- Clone this repository
- Change into this project directory `cd twovotes`
- Add the project environmental variables by creating .env file using the pattern in the env.sample file in this project
- Install the packages `npm install`
- Start the application `npm start`
- Navigate to `localhost:4000` on your browser or if you set port in your env file,
navigate to `localhost:<YOUR_PORT>`

### Deployment
This guide is for heroku. For other platforms, package.json is all yours to tweak.
- push you code to Heroku either using heroku CLI or Dashboard.
- Set your environmental variables on Heroku which also has `MONGODB_URI` for connecting
to your database.
- Your app should be live. 
- If any error comes up, check your Procfile and make sure you are having the right starting command.

### Upgrade
I started this project back then in 2016 using only server side technologies.
The code were a little bit rough as I majorly depended on using ES5 then. Though, I have refactored
the project to match some standard in ES6 but I think is time I rewrite everything with the present
day technologies. Hence, watch out for the version of this project in ReacJS and RESTful API based
on NodeJS.

### Contribution
- I appreciate, but I rarely work on this anymore unless to fix bug and do some refactoring. I will rather have you
joining me on the React version of this project. 
### Licence
MIT

 

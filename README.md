# [The App Brewery - Back-end project 05 - Blog website](https://gabriel-blog-website.herokuapp.com/)

## Udemy - The Complete 2020 Web Development Bootcamp

### Section 23: Boss Level Challenge 3 - Blog Website
### Section 30: Boss Level Challenge 4 - Blog Website Upgrade
A back-end program, that can manage a blog website. The site can create, edit and delete blog posts, and the posts are stored in a database.
 - Mongoose - MongoDB
 - EJS
 - Express
 - Node.js
 - HTML5
 - CSS3

#### My Blog-Website is deployed on [Heroku](https://gabriel-blog-website.herokuapp.com/) and [you can see the maintenance page here](https://gabriel-blog-website.herokuapp.com/maintenance)

#### How to run: (from terminal)
 Clone the repository:
 > git clone https://github.com/ArpadGBondor/The_App_Brewery-Back-end_project_05-Blog_website.git

 Enter directory:
 > cd The_App_Brewery-Back-end_project_05-Blog_website/

 Download the missing dependencies from npm:
 > npm install

 Download, install and run MongoDB
 > https://www.mongodb.com/try/download/community

 Create a file named '.env' and set this [enviroment variable](https://www.npmjs.com/package/dotenv):
 > DB_CONNECT=mongodb://localhost:27017/BlogDB

Run program: 
 > node app.js

 To see the blog:
 > Open: http://localhost:3000

 To create, edit or delete posts:
 > Open: http://localhost:3000/maintenance

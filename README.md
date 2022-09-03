## About
A recipe-sharing website where users can create an account to upload recipes or search for recipes posted by other users. I made this project to learn how to use Spring Boot for web applications.

Website URL: https://therecipebowl.netlify.app/

## Tech Stack
- Frontend: React, Bootstrap
- Backend: Java / Spring Boot
- Database: MySQL
- Deployment: Netlify (frontend) and Heroku (backend)

## Features
- Account creation
  - Email verification using "Spring Boot Starter Mail" dependency
  - BCrypt password encoding to save passwords to the database
  - Profile editing
  - Forgot password / password reset
- Authentication with JWTs
- Form validation with Formik and Yup
  - Registration
    - Check if entered username is taken
    - Username cannot contain spaces or special characters
    - Check if email is valid
    - Check if email is already being used with another account
    - No fields can be empty
    - Password at least 6 characters long
  - Log in
    - Check if correct username and password
    - Check if account is activated
  - Account Settings
    - Check if new username is taken
    - Username cannot contain spaces or special characters
    - Username cannot be empty
    - Check if email is already associated with another account
  - Posting/Editing Recipes
    - No field can be empty
    - At least one ingredient, one direction, and one tag
- Image uploads with Cloudinary
- Uploading and editing recipes
- Search page
- Rate and review recipes
- Admin privileges 
  - Delete recipes, accounts, reviews
  - Edit roles of accounts

## Screenshots
### Home Page
![image](https://user-images.githubusercontent.com/65355965/188271817-61dcd3e3-f390-4f01-bca6-dec3eaec6a2d.png)

### Registration
![image](https://user-images.githubusercontent.com/65355965/188272088-d322afc9-cde3-49a2-b0a7-5706761aa0f0.png)

### Log in
![image](https://user-images.githubusercontent.com/65355965/188272122-c751d6c0-40be-4396-9bdc-3dcaa9c160ff.png)

### Account Settings
![image](https://user-images.githubusercontent.com/65355965/188272454-fde04857-351d-40c3-89ed-aec39e7ead7f.png)

### Uploading a recipe
![image](https://user-images.githubusercontent.com/65355965/188272740-e67e5997-17c9-407d-8f07-fa956b0a0be7.png)

### Profile Page
![image](https://user-images.githubusercontent.com/65355965/188272785-cd68bfee-aad9-4aa0-982b-2ba662fc27a3.png)

### Searching a recipe
![image](https://user-images.githubusercontent.com/65355965/188272930-b3fa3c27-5261-4e17-9065-ffa76a543c60.png)

### Recipe Page
![image](https://user-images.githubusercontent.com/65355965/188273090-29209e1f-7808-4002-b35f-785f4321b368.png)

### Writing a review
![image](https://user-images.githubusercontent.com/65355965/188273061-2b5e97ae-b476-4873-a61d-fc8055385f3f.png)

### Navbar with when logged in as an admin
![image](https://user-images.githubusercontent.com/65355965/188273188-89579fce-3e16-4ae3-b4c7-c3abca04a4fe.png)

### Admin Page (recipes)
![image](https://user-images.githubusercontent.com/65355965/188273209-4c4c472a-f8b2-4161-a114-ec31d2d57efb.png)

### Admin Page (accounts)
![image](https://user-images.githubusercontent.com/65355965/188273352-c31ce193-8a57-4f5c-8a79-2b886dbc558e.png)

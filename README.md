# Personal Inventory Management

This is a single page web application with multiple views. This is build using NodeJS. The framework used for this application is AngularJS. For the visuals, Angular Material was again used. It is a library provided by Google to give websites the material design look that is used in Android phones since Lollipop.

The authentication is powered via Firebase Authentication. Firebase authentication is a backend service that takes care of all the authentication needs. It checks that the email is a valid email and encrypts the passwords automatically.

Next part is the item upload. The image chooser for the item upload is from a bower module called angular-material-fileinput (https://github.com/shuyu/angular-material-fileinput). This provides the ability to drag and drop files into the input as well as previewing the files. Once the image is uploaded, it is sent to Google Cloud Vision API requesting the label detection service only to save on API calls. The API returns a set of labels that it believes is in the image.

Once the item is added, a reference is saved in Firebase NoSQL database and the image is stored in Firebase Storage.
I used an Angular Seed so I do not have to build the entire architecture from scratch. The seed is available on GitHub: https://github.com/angular/angular-seed. For the animations, I used animate.css which is available from https://daneden.github.io/animate.css/. For the user profile image I used angular-avatar to generate avatars based on the user’s first name: https://github.com/ajsoriar/angular-avatar.

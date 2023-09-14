# workinda
Submitted as ROUND 1 API For Campus Recruitment
Hey there, Mr. X. You have been appointed to design a railway management system like IRCTC, where users can come on the platform
and check if there are any trains available between 2 stations.
The app will also display how many seats are available between any 2 stations and the user can book a seat if the availability > 0 after
logging in. Since this has to be real-time and multiple users can book seats simultaneously, your code must be optimized enough to handle
large traffic and should not fail while doing any bookings.
If more than 1 users simultaneously try to book seats, only either one of the users should be able to book. Handle such race conditions
while booking.
There is a Role Based Access provision and 2 types of users would exist :
1. Admin - can perform all operations like adding trains, updating total seats in a train, etc.
2. Login users - can check availability of trains, seat availability, book seats, get booking details, etc.
Tech Stack:
1. Any web server of your choice (Python Flask / Django, NodeJS Express / Koa, Java, etc)
2. Database: MySQL/PostgreSQL (Compulsory)

const Sequelize = require('sequelize');
const { User, Train, Booking } = require('./models'); // Import your models
const sequelize = new Sequelize('railway_management', 'droot', '@nanya0269T', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  sequelize.sync()
  .then(() => {
    console.log('Database schema synchronized.');
  })
  .catch(err => {
    console.error('Unable to synchronize database schema:', err);
  });
  // Query all users
User.findAll().then(users => {
    console.log('All users:', users);
  });
  const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/connection'); // Import your Sequelize connection

const User = sequelize.define('User', {
  // Define model attributes
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = User;
const { Sequelize, DataTypes } = require('sequelize');
sequelize = require('../database/connection');

const Train = sequelize.define('Train', {
  train_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  seat_capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  arrival_time_at_source: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  arrival_time_at_destination: {
    type: DataTypes.TIME,
    allowNull: false,
  },
});

module.exports = Train;
const { Sequelize, DataTypes } = require('sequelize');
sequelize = require('../database/connection');

const Booking = sequelize.define('Booking', {
  train_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  no_of_seats: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seat_numbers: {
    type: DataTypes.JSON, // Assuming you store seat numbers as JSON
  },
  arrival_time_at_source: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  arrival_time_at_destination: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Booking;
User.hasMany(Booking, { foreignKey: 'user_id' });
User = require('../models/User');

// Find all users
User.findAll().then(users => {
  console.log('All users:', users);
});
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, createTrain, getSeatAvailability, bookSeat, getBookingDetails } = require('./controllers');

// User registration
router.post('/signup', registerUser);

// User login
router.post('/login', loginUser);

// Admin creates a new train
router.post('/trains/create', createTrain);

// Get seat availability
router.get('/trains/availability', getSeatAvailability);

// User books a seat
router.post('/trains/:train_id/book', bookSeat);

// Get booking details
router.get('/bookings/:booking_id', getBookingDetails);

module.exports = router;
const jwt = require('jsonwebtoken'); // For creating JWT tokens

// Function to handle user registration
async function registerUser(req, res) {
  try {
    const { username, password, email } = req.body;

    // Validate input (you can use a validation library like Joi or Yup)
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if the username or email is already registered
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    // Create a new user record
    const newUser = await User.create({ username, password, email });

    // Generate a JWT token for authentication
    const token = jwt.sign({ userId: newUser.id }, 'your_secret_key');

    return res.status(201).json({ message: 'Account successfully created', user_id: newUser.id, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Function to handle user login
async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Authenticate the user (check if username and password match)
    const user = await User.findOne({ where: { username } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Incorrect username or password. Please retry' });
    }

    // Generate a JWT token for authentication
    const token = jwt.sign({ userId: user.id }, 'your_secret_key');

    return res.status(200).json({ status: 'Login successful', user_id: user.id, access_token: token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  registerUser,
  loginUser,
};
// Function to add a new train
async function addTrain(req, res) {
    try {
      const { train_name, source, destination, seat_capacity, arrival_time_at_source, arrival_time_at_destination } = req.body;
  
      // Validate input
      if (!train_name || !source || !destination || !seat_capacity || !arrival_time_at_source || !arrival_time_at_destination) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
  
      // Create a new train record
      const newTrain = await Train.create({ train_name, source, destination, seat_capacity, arrival_time_at_source, arrival_time_at_destination });
  
      return res.status(201).json({ message: 'Train added successfully', train_id: newTrain.id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
}
  
  // Function to get seat availability for a route
  // Function to get seat availability for a route
async function getSeatAvailability(req, res) {
    try {
      const { source, destination } = req.query;
  
      // Validate input
      if (!source || !destination) {
        return res.status(400).json({ error: 'Source and destination are required.' });
      }
  
      // Query the database to get train data based on the source and destination
      const trains = await Train.findAll({ where: { source, destination } });
  
      // Calculate seat availability for each train
      const availabilityData = [];
  
      for (const train of trains) {
        // Calculate the number of booked seats for this train
        const bookedSeats = await Booking.sum('no_of_seats', {
          where: { train_id: train.id },
        });
  
        // Calculate available seats
        const availableSeats = train.seat_capacity - bookedSeats;
  
        availabilityData.push({
          train_id: train.id,
          train_name: train.train_name,
          available_seats,
        });
      }
  
      return res.status(200).json(availabilityData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
    // Function to book seats on a train
async function bookSeats(req, res) {
    try {
      const { train_id, user_id, no_of_seats } = req.body;
  
      // Validate input
      if (!train_id || !user_id || !no_of_seats) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
  
      // Check seat availability for the selected train
      const train = await Train.findByPk(train_id);
  
      if (!train) {
        return res.status(404).json({ error: 'Train not found' });
      }
  
      const bookedSeats = await Booking.sum('no_of_seats', {
        where: { train_id },
      });
  
      const availableSeats = train.seat_capacity - bookedSeats;
  
      if (availableSeats < no_of_seats) {
        return res.status(400).json({ error: 'Not enough available seats.' });
      }
  
      // Implement seat booking logic to select available seats
      const selectedSeats = []; // Implement logic to select seat numbers
  
      // Create a new booking record
      const newBooking = await Booking.create({
        train_id,
        user_id,
        no_of_seats,
        seat_numbers: selectedSeats,
      });
  
      return res.status(201).json({
        message: 'Seat booked successfully',
        booking_id: newBooking.id,
        seat_numbers: selectedSeats,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
    
  
  module.exports = {
    addTrain,
    getSeatAvailability,
  };
  const express = require('express');
const app = express();

const userController = require('./controllers/userController');
const trainController = require('./controllers/trainController');
const bookingController = require('./controllers/bookingController');

// Define routes and use controller functions as middleware
app.post('/api/signup', userController.registerUser);
app.post('/api/login', userController.loginUser);
app.post('/api/trains/create', trainController.addTrain);
app.post('/api/trains/availability', trainController.getSeatAvailability);
app.post('/api/bookings/create', bookingController.bookSeats);
app.get('/api/bookings/:booking_id', bookingController.getBookingDetails);

// Start your Express app and listen for incoming requests
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const express = require('express');
const bodyParser = require('body-parser');
const application = express();

// Parse JSON request data
app.use(bodyParser.json());

// Import and use API routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

  
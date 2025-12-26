const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

const router = express.Router();

const uploadEvents = upload("events");

router.post('/', protect, uploadEvents.array('eventImage', 5), createEvent);
router.get('/', protect, getEvents);
router.put('/:id', protect, uploadEvents.array('eventImage', 5), updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;

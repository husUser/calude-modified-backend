const { Notifications } = require('../models'); 

// ✅ Create (Post) Notification
const postNotification = async (req, res) => {
  const { notificationMessage } = req.body;
  const { userId } = req.user;

  try {
    const newNotification = await Notifications.create({
      notificationMessage,
      userId,
    });

    res.status(201).json({
      message: "Notification added successfully",
      data: newNotification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add notification",
      error: error.message,
    });
  }
};

// ✅ Get All Notifications for Logged-in User
const getAllNotification = async (req, res) => {
  const { userId } = req.user;

  try {
    const notifications = await Notifications.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// ✅ Delete Notification by ID
const deleteNotification = async (req, res) => {
  const { notificationId} = req.params;
  const { userId } = req.user;

  try {
    const notification = await Notifications.findOne({
      where: { notificationId, userId },
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found or unauthorized",
      });
    }

    await notification.destroy();

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

module.exports = {
  getAllNotification,
  postNotification,
  deleteNotification,
};

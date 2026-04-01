const { Notification, ParentStudent } = require("../models");

const notifyUser = async (userId, type, title, message, metadata = null) =>
  Notification.create({
    userId,
    type,
    title,
    message,
    metadata,
    isRead: false,
  });

const notifyParentsForStudent = async (
  studentId,
  type,
  title,
  message,
  metadata = null,
) => {
  const links = await ParentStudent.findAll({
    where: { studentId },
    attributes: ["parentId"],
  });

  if (!links.length) {
    return [];
  }

  return Promise.all(
    links.map((link) => notifyUser(link.parentId, type, title, message, metadata)),
  );
};

module.exports = {
  notifyUser,
  notifyParentsForStudent,
};

const userService = require('../services/user.service');

const createUser = (req, res) => {
  const { nombre, email, password } = req.body;

  const result = userService.createUser({ nombre, email, password });

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  res.status(201).json(result);
};

module.exports = { createUser };

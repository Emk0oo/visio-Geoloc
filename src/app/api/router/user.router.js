const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');

router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.disconnectUser); // Nouvelle route
router.get('/', userController.getAllUsers);

module.exports = router;
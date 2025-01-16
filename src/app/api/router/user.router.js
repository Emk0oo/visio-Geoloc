const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');

router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.get('/', userController.getAllUsers);

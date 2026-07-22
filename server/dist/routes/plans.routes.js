"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const plans_controller_1 = require("../controllers/plans.controller");
const router = (0, express_1.Router)();
router.get('/', plans_controller_1.getPlans);
router.get('/:id', plans_controller_1.getPlanById);
exports.default = router;

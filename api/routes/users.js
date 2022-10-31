const express = require("express");
const { auth, authAdmin } = require("../middlewares/auth");
const { authCtrl } = require("../controllers/authControll");
const { userCtrl } = require("../controllers/userControll");
const router = express.Router();

router.post("/", authCtrl.signUp)
router.post("/login", authCtrl.login)

router.get("/myInfo", auth, userCtrl.myInfo)
router.delete("/:delId", auth, userCtrl.deleteUser)
router.get("/usersList", authAdmin, userCtrl.userList)
module.exports = router;

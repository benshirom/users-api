const { UserModel } = require("../models/userModel");

exports.userCtrl = {
  myInfo: async (req, res) => {
    try {
      let userInfo = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
      res.json(userInfo);
    }
    catch (err) {
      console.log(err)
      res.status(500).json({ msg: "err", err })
    }
  },
  editUser: async (req, res) => {
    try {
      let editId = req.params.editId;
      let userInfo;

      userInfo = await UserModel.updateOne({ _id: editId }, { password: 0 });

      res.json(userInfo);
    }
    catch (err) {
      console.log(err)
      res.status(500).json({ msg: "err", err })
    }
  },
  deleteUser: async (req, res) => {
    try {
      let delId = req.params.delId;
      let userInfo;

      if (req.tokenData.role == "admin") {
        userInfo = await UserModel.deleteOne({ _id: delId }, { password: 0 });
      }
      else if (req.tokenData._id == delId) {
        userInfo = await UserModel.deleteOne({ _id: req.tokenData._id }, { password: 0 });
      }
      res.json(userInfo);
    }
    catch (err) {
      console.log(err)
      res.status(500).json({ msg: "err", err })
    }
  }
  , userList: async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id"
    let reverse = req.query.reverse == "yes" ? -1 : 1;
    try {
      let data = await UserModel.find({}, { password: 0 })
        .limit(perPage)
        .skip((page - 1) * perPage)
        .sort({ [sort]: reverse })
      res.json(data);

    }
    catch (err) {
      console.log(err)
      res.status(500).json({ msg: "err", err })
    }
  }
}
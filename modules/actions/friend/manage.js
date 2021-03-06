const moment = require('moment');

const requestModel = require(__base + 'models/request');
const profileModel = require(__base + 'models/profile');

const errorHandler = (err, res) => {
  res.json({
    "success": false,
    "msg": "There is some error.",
    "error": err.message
  });
}

const manageFriend = (req, res) => {
  let type = req.params.type;
  let friend = req.params.id;
  let user = req.info.id;

  const acceptRequest = (id) => {
    requestModel.findOneAndUpdate(
      { $and: [{ "requester": id }, { "recipient": user }] },
      { $set: { "status": 1 } }, (err, result) => {
        if (err) {
          errorHandler(err, res);
        }
        else {
          if (result) {
            let fr = (id) => {
              return {
                "id": id,
                "since": moment(),
                "relation": 1
              }
            };

            profileModel.findOneAndUpdate({ userid: user }, { $push: { friends: fr(friend) } }, (err, result) => {
              if (err) {
                errorHandler(err, res);
              }
              else {
                profileModel.findOneAndUpdate({ userid: friend }, { $push: { friends: fr(user) } }, (err, result) => {
                  if (err) {
                    errorHandler(err, res);
                  }
                  else {
                    res.json({
                      success: true,
                      msg: "Accepted."
                    });
                  }
                });
              }
            });
          }
          else {
            res.json({
              success: false,
              msg: "There is some error !"
            });
          }
        }
      });
  }

  const deleteRequest = (id) => {
    requestModel.findOneAndUpdate({ $and: [{ "requester": id }, { "recipient": user }] }, { $set: { "status": 2 } }, (err, result) => {
      if (err) {
        errorHandler(err, res);
      }
      else {
        if (result) {
          res.json({
            success: true,
            msg: "Deleted."
          });
        }
        else {
          res.json({
            success: false,
            msg: "There is some error !"
          });
        }
      }
    });
  }

  const unfriendFriend = (id) => {
    requestModel.findOneAndRemove({ $and: [{ "requester": id }, { "recipient": user }] }, (err, result) => {
      if (err) {
        errorHandler(err, res);
      }
      else {
        if (result) {
          profileModel.findOneAndUpdate({ userid: user }, { $pull: { "friends": { "id": friend } } }, (err, result) => {
            if (err) {
              errorHandler(err, res);
            }
            else {
              profileModel.findOneAndUpdate({ userid: friend }, { $pull: { "friends": { "id": user } } }, (err, result) => {
                if (err) {
                  errorHandler(err, res);
                }
                else {
                  res.json({
                    success: true,
                    msg: "Unfriended."
                  });
                }
              });
            }
          });
        }
        else {
          res.json({
            success: false,
            msg: "There is some error !"
          });
        }
      }
    });
  }

  const blockPerson = (id) => {
    requestModel.findOneAndUpdate({ $and: [{ "requester": id }, { "recipient": user }] }, { $set: { "status": -1 } }, (err, result) => {
      if (err) {
        errorHandler(err, res);
      }
      else {
        if (result) {
          res.json({
            success: true,
            msg: "Blocked."
          });
        }
        else {
          res.json({
            success: false,
            msg: "There is some error !"
          });
        }
      }
    });
  }

  switch (type) {
    case 'delete':
      deleteRequest(friend);
      break;
    case 'accept':
      acceptRequest(friend);
      break;
    case 'unfriend':
      unfriendFriend(friend);
      break;
    case 'block':
      blockPerson(friend);
      break;
    default:
      res.json({
        "success": false,
        "msg": "Invalid Option."
      });
      break;
  }

}

module.exports = manageFriend;

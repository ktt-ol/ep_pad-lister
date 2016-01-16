'use strict';

var eejs = require('ep_etherpad-lite/node/eejs');
var padManager = require('ep_etherpad-lite/node/db/PadManager');
var dateFormat = require('dateformat');

var PRIVATE_PAD_PREFIX = 'private_';

exports.eejsBlock_indexWrapper = function (hook_name, args, cb) {
  var render_args = {
    PRIVATE_PAD_PREFIX: PRIVATE_PAD_PREFIX
  };
  args.content = args.content + eejs.require("ep_pad-lister/templates/linkToList.ejs", render_args);
  return cb();
};

exports.registerRoute = function (hook_name, args, cb) {
  args.app.get('/pad-lister/static/bootstrap.min.css', function (req, res) {
    res.sendFile(__dirname + '/static/css/bootstrap.min.css');
  });

  args.app.get('/pad-lister', function (req, res) {
    getDetailedPadList(function (pads) {
      var render_args = {
        PRIVATE_PAD_PREFIX: PRIVATE_PAD_PREFIX,
        pads: pads
      };
      res.send(eejs.require('ep_pad-lister/templates/list.html', render_args));
    });
  });
};

function getDetailedPadList(callback) {

  var padsToDo;
  var padData = [];

  function doneAction() {
    padsToDo--;
    if (padsToDo > 0) {
      return;
    }
    // sort
    padData = sortPadData(padData);
    // format each timestamp
    padData.forEach(function (padObj) {
      padObj.lastAccess = formatDate(padObj.lastAccess);
    });
    callback(padData);
  }

  padManager.listAllPads(function (err, listResult) {
    var padNames = listResult.padIDs;
    // if we have no pads...
    if (padNames.length === 0) {
      callback([]);
      return;
    }

    padsToDo = padNames.length;
    padNames.forEach(function (padName) {
      // ignore private pads
      if (padName.indexOf(PRIVATE_PAD_PREFIX) === 0) {
        doneAction();
        return;
      }
      padManager.getPad(padName, function (err, pad) {
        // ignore pads without any changes
        if (pad.head === 0) {
          doneAction();
          return;
        }
        pad.getLastEdit(function (err, time) {
          padData.push({
            name: padName,
            lastRevision: pad.head,
            lastAccess: time
          });

          doneAction();
        });
      }); // end getPad
    }); // end forEach
  });
}

// sort by last access
function sortPadData(padData) {
  return padData.sort(function (a, b) {
    return b.lastAccess - a.lastAccess;
  });
}

function formatDate(timestamp) {
  return dateFormat(new Date(timestamp), 'dd.mm.yyyy HH:MM:ss');
}

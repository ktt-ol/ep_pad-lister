'use strict';

var eejs = require('ep_etherpad-lite/node/eejs');
var padManager = require('ep_etherpad-lite/node/db/PadManager');
var dateFormat = require('dateformat');

exports.eejsBlock_indexWrapper = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_pad-lister/templates/linkToList.ejs");
  return cb();
}

exports.registerRoute = function (hook_name, args, cb) {
  var h = '<b>test</b>'
  args.app.get('/pad-lister/static/bootstrap.min.css', function (req, res) {
    res.sendfile(__dirname + '/static/css/bootstrap.min.css');
  });

  args.app.get('/pad-lister', function (req, res) {
    getDetailedPadList(function (pads) {
      var render_args = {
        pads: pads
      };
      res.send(eejs.require('ep_pad-lister/templates/list.html', render_args));
    });
  });
};

function getDetailedPadList(callback) {
  padManager.listAllPads(function (err, listResult) {
    var padNames = listResult.padIDs;

    var padData = [];
    padNames.forEach(function (padName) {
      padManager.getPad(padName, function (err, pad) {
        pad.getLastEdit(function (err, time) {
          padData.push({
            name: padName,
            lastRevision: pad.head,
            lastAccess: time
          });

          if (padData.length === padNames.length) {
            // sort
            padData = sortPadData(padData);
            // format each timestamp
            padData.forEach(function (padObj) {
              padObj.lastAccess = formatDate(padObj.lastAccess);
            });
            callback(padData);
          }
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
  return dateFormat(new Date(timestamp), 'dd.mm.yyyy hh:MM:ss');
}

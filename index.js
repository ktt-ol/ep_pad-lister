'use strict';

const eejs = require('ep_etherpad-lite/node/eejs');
const padManager = require('ep_etherpad-lite/node/db/PadManager');
const dateFormat = require('dateformat');
const db = require('ep_etherpad-lite/node/db/DB').db;

const PRIVATE_PAD_PREFIX = 'private_';

exports.eejsBlock_indexWrapper = function (hook_name, args, cb) {
  const render_args = {
    PRIVATE_PAD_PREFIX: PRIVATE_PAD_PREFIX
  };
  args.content = args.content + eejs.require("ep_pad-lister/templates/linkToList.ejs", render_args);
  return cb();
};

exports.registerRoute = function (hook_name, args, cb) {
  args.app.get('/pad-lister/static/bootstrap.min.css', (req, res) => {
    res.sendFile(__dirname + '/static/css/bootstrap.min.css');
  });

  args.app.get('/pad-lister', (req, res) => {
    getDetailedPadList().then(pads => {
      const render_args = {
        PRIVATE_PAD_PREFIX: PRIVATE_PAD_PREFIX,
        pads: pads
      };
      res.send(eejs.require('ep_pad-lister/templates/list.html', render_args));
    });
  });
};

async function getDetailedPadList() {
  let padData = [];

  const listResult = await padManager.listAllPads();
  const padIDs = listResult.padIDs;

  // if we have no pads...
  if (padIDs.length === 0) {
    return [];
  }

  // padsToDo = padNames.length;
  for (let i = 0; i < padIDs.length; i++) {
    const padID = padIDs[i];

    // ignore private pads
    if (padID.indexOf(PRIVATE_PAD_PREFIX) === 0) {
      continue;
    }
    const pad = await padManager.getPad(padID);
    if (!pad) {
      continue;
    }
    // ignore pads without any changes
    if (pad.head === 0) {
      continue;
    }
    // support for ep_set_title_on_pad
    let title;
    db.get("title:"+padID, function(err, value){
      if(!err && value) {
        title = value;
      }
    });
    const time = await pad.getLastEdit();
    padData.push({
      name: title ? title+' ('+padID+')' : padID,
      padid: padID,
      lastRevision: pad.head,
      lastAccess: time
    });
  }

  padData = sortPadData(padData);

  // format each timestamp
  padData.forEach(function (padObj) {
    padObj.lastAccess = formatDate(padObj.lastAccess);
  });

  return padData;
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

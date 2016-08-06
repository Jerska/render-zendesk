var system = require('system');
var webpage = require('webpage');

var START_WAIT_TIME = 5000;

var INTERVAL = 100;

var WIDTH = 1024;
var HEIGHT = 800;

var app_name = system.args[1];
var website = 'https://' + app_name + '.zendesk.com/hc/';

var recording = true;

var page = webpage.create();
page.viewportSize = { width: WIDTH, height: HEIGHT };
page.clipRect = { top: 0, left: 0, width: WIDTH, height: HEIGHT };

function keyAction (key, delay) {
  if (delay === undefined) delay = 600;
  return {
    name: 'Key press' + (typeof key === 'string' ? (': ' + key) : ''),
    action: function () {
      page.sendEvent('keypress', key);
    },
    delay: delay
  }
}

function focus () {
  return {
    name: 'Focus input',
    action: function () {
      page.evaluateJavaScript(
        'function () {' +
        '  document.querySelector("input[type=search],input[type=text]").focus();' +
        '}'
      )
    },
    delay: 200
  };
}

var actions = [
  {
    name: 'Add <script> and <link>',
    action: function () {
      page.evaluateJavaScript(
        'function () {' +
        '  var style = document.createElement("link");' +
        '  style.rel = "stylesheet";' +
        '  style.href = "//cdn.jsdelivr.net/algoliasearch.zendesk-hc/latest/algoliasearch.zendesk-hc.min.css";' +
        '  document.head.appendChild(style);' +
        '' +
        '  var s = document.createElement("script");' +
        '  s.type = "text/javascript";' +
        '  s.src = "//cdn.jsdelivr.net/algoliasearch.zendesk-hc/latest/algoliasearch.zendesk-hc.min.js";' +
        '  document.head.appendChild(s);' +
        '}'
      );
    },
    delay: START_WAIT_TIME
  },
  {
    name: 'Launch algoliasearchZendeskHC',
    action: function () {
      page.evaluateJavaScript(
        'function () {' +
        '  algoliasearchZendeskHC({' +
            'applicationId: "latency",' +
            'apiKey: "88209bb425570ef10733c0ba3157bac3",' +
            'subdomain: "algolia-test",' +
            'autocomplete: {' +
            '  inputSelector: "input[type=search],input[type=text]"' +
            '}' +
        '  });' +
        '' +
        '  var DOMContentLoaded_event = document.createEvent("Event");' +
        '  DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);' +
        '  window.document.dispatchEvent(DOMContentLoaded_event);' +
        '}'
      );
    },
    delay: 200
  },
  focus(),
  keyAction('p', 1000),
  keyAction('a'),
  keyAction('s'),
  keyAction('s'),
  keyAction('w'),
  keyAction('o'),
  keyAction('r'),
  keyAction('d'),
  focus(),
  keyAction(page.event.key.Down, 500),
  keyAction(page.event.key.Down, 500),
  keyAction(page.event.key.Down, 500)
]

function executeActionRec (i) {
  var a = actions[i];
  if (!a) {
    recording = false;
    return;
  }
  setTimeout(function () {
    executeActionRec(i + 1);
  }, a.delay);
  console.log('Action ' + (i + 1) + ': ' + a.name);
  a.action();
}

function executeAction () {
  executeActionRec(0);
}

function takeScreenshot (i) {
  if (recording) {
    setTimeout(takeScreenshot.bind(null, i + 1), INTERVAL);
  }
  console.log('Screenshot ' + i);
  page.render('images/' + app_name + '/' + ('000' + i).slice(-3) + '.png');
  if (!recording) {
    setTimeout(phantom.exit, INTERVAL);
  }
}

function takeScreenshots () {
  setTimeout(takeScreenshot.bind(null, 1), START_WAIT_TIME);
}

page.open(website, function () {
  page.evaluate(function() {
    document.body.bgColor = 'white';
  });
  executeAction();
  takeScreenshots();
});


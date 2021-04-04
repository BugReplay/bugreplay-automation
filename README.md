# BugReplay Automation Library
This package is used for controlling the BugReplay extension automatically for the sole purpose of creating BugReplay screencasts using WebdriverIO, Cypress, NightwatchJS and TestCafe test suites.

This package is included as a dependency when you use one of the bugreplay automation frameworks mentioned above. Once you install the bugreplay automation framework, just provide the path to the bugreplay automation extension included with this package and you should be good to start recording your automated test suites.

Currently we support only Chrome and MS Edge browsers. Here's how you can configure your test suites:

### Chrome
    desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: [
            '--load-extension=node_modules/bugreplay-automation/extension/ ',
            '--auto-select-desktop-capture-source=Record This Window'
          ]
       }
    }


### MSEdge 
    desiredCapabilities: {
        browserName: 'MicrosoftEdge',
        'ms:edgeOptions': {
          w3c: false,
          args: [
            '--load-extension=node_modules/bugreplay-automation/extension/ ',
            '--auto-select-desktop-capture-source=Record This Window'
          ]
       }
    }
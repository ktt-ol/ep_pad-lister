# Archived 

This plugin is only tested for the v1.x versions. I don't use it anymore and don't have time to test and check any pull requests. Please create a fork that works for newer versions.

# ep_pad-lister

A plugin for Etherpad-lite that shows a list of all pads sorted by last edit date.


# Features

* List all pads, shows revision and last edit date
* Ignores pads without any changes
* Ignores private pads (= pads starting with `private_`)
* Supports [ep\_set\_title\_on\_pad](https://github.com/JohnMcLear/ep_set_title_on_pad)

# Screenshots

**New pad**
![New Pad](https://ktt-ol.github.io/ep_pad-lister/images/new_pad.jpg)

**Pad list**
![Pad_List](https://ktt-ol.github.io/ep_pad-lister/images/pad_list.jpg)


# Install

This plugin requires Etherpad 1.8 or newer since version 1.2.0.
For older Etherpad installations, use an earlier version of this plugin.

The integration with ep_set_title_on_pad has been updated to use
Etherpad's Promise-based database API and has been tested with
Etherpad 3.3.15. Compatibility of this change with older Etherpad
versions has not been verified.

## Etherpad 3.x

Install the plugin from your Etherpad directory:

```shell
pnpm run plugins install ep_pad-lister
```

## Older Etherpad versions

Install the plugin from your Etherpad directory:

```shell
npm install ep_pad-lister
```

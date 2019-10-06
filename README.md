# ep_pad-lister

A plugin for Etherpad-lite that shows a list of all pads sorted by last edit date.

# Features

* List all pads, shows revision and last edit date
* Ignores pads without any changes
* Ignores private pads (= pads starting with `private_`)


# Screenshots

**New pad**
![New Pad](https://ktt-ol.github.io/ep_pad-lister/images/new_pad.jpg)

**Pad list**
![Pad_List](https://ktt-ol.github.io/ep_pad-lister/images/pad_list.jpg)

# Install

    npm install ep_pad-lister (from your etherpad-lite folder)


Put the follwing snippet into ```src/static/skins/no-skin/index.css```

```
.pad-lister-link-container {
  font-size: 16px;
  max-width: 500px;
  text-align:center;
  min-height: 20px;
  padding: 19px;
  margin: 50px auto;
  background-color: #f5f5f5;
  border: 1px solid #e3e3e3;
  border-radius: 4px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
}
.pad-lister-link-container .code {
  font-family: monospace;
  padding: 0 5px;
  color: #c7254e;
  background-color: #fff;
}
```

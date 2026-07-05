# LCStats Overlay

OBS Browser Source overlay for showing a Google Sheets key-value summary.

## Setup

1. Copy `config.example.json` to `config.json`.
2. Replace `YOUR_SPREADSHEET_ID_HERE` with your Google Spreadsheet ID.
3. Make sure the spreadsheet is readable by OBS:
   - Share it with "Anyone with the link can view", or
   - Publish it to the web.

`config.json` is ignored by Git so your spreadsheet ID stays local.

## Spreadsheet Format

The overlay reads the `Value` sheet as a vertical key-value table.

| Column A | Column B |
| --- | --- |
| P3D Avg/Med | 100/100 |
| Q2+ Avg/Med | 200/200 |
| Clear | 58.3 % |

The key names in column A must match the labels hardcoded in `index.html`.

## OBS Usage

Add `index.html` as a Browser Source. Recommended source settings:

- Local file or a locally served URL
- Transparent background
- Width around `720`
- Height around `120`

If your OBS/Chromium environment blocks `fetch("./config.json")` from a local file, serve this folder with a local static server and use the localhost URL in OBS.

Example:

```sh
python3 -m http.server 8000
```

Then use:

```text
http://localhost:8000/index.html
```

## Font License

This overlay includes `assets/3270-Regular.ttf` from
[rbanffy/3270font](https://github.com/rbanffy/3270font).

The upstream `LICENSE.txt` lists copyright holders for the 3270font project
and permits redistribution and use in source and binary forms under BSD-style
terms. It also notes that the FontForge SFD font description file is optionally
licensed under the SIL Open Font License v1.1 with no Reserved Font Name.

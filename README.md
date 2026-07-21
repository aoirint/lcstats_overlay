# LCStats Overlay

OBS Browser Source overlay for showing a Google Sheets key-value summary.

## Setup

1. Copy `config.example.json` to `config.json`.
2. Replace `YOUR_SPREADSHEET_ID_HERE` with your Google Spreadsheet ID.
3. Make sure the spreadsheet is readable by OBS:
   - Share it with "Anyone with the link can view", or
   - Publish it to the web.

`config.json` is ignored by Git so your spreadsheet ID stays local.

## Privacy and Publication

The spreadsheet ID is an identifier, not a secret or an access-control mechanism.
The overlay must be able to read the `Value` sheet from OBS, so the spreadsheet is shared with
"Anyone with the link" or published to the web.

Google Sheets sharing applies to the entire spreadsheet, not an individual tab.
Only store stream-safe aggregate values in a spreadsheet shared for the overlay.
Keep run history, raw JSON, player information, or any other non-public data in a separate private spreadsheet.

Do not commit `config.json`, a web app URL containing a token, or exported spreadsheet data.
Avoid showing a token in a stream, screenshot, or OBS source configuration.

## Apps Script Ingestion Security

`code.gs` accepts game-stat POSTs through an Apps Script web app.
Every request requires the `LCSTATS_TOKEN` script property; the endpoint refuses all writes until it is configured.

1. Open the Apps Script project that contains `code.gs`.
2. In **Project Settings**, add a Script property named `LCSTATS_TOKEN`.
   Set it to a long, randomly generated value.
3. Deploy the script as a web app from **Deploy > New deployment > Web app**.
   Select the execution identity that has access to the destination spreadsheet.
4. Configure the game-side sender to POST to the deployment's `/exec` URL with
    the same token as a `token` query or form parameter.

Apps Script web-app access and execution identity are separate deployment settings.
If the sender cannot authenticate with Google, the web app may need anonymous
access, but the token remains mandatory and must be kept secret.
Rotate `LCSTATS_TOKEN` immediately if its URL or value is exposed.

Use the `/dev` URL only for development; it is available only to script editors.
Use a versioned `/exec` deployment for normal operation.

See Google's [Web Apps guide](https://developers.google.com/apps-script/guides/web) and
[Properties Service guide](https://developers.google.com/apps-script/guides/properties) for deployment and property details.

## Spreadsheet Format

The overlay reads the `Value` sheet as a vertical key-value table.

| Column A | Column B |
| --- | --- |
| Ship Total | 1234 |
| Q1 Avg/Med | 100/100 |
| Q2+ Avg/Med | 200/200 |
| Clear | 58.3 % |

The overlay displays `Q2+ Avg/Med`, but falls back to `Q1 Avg/Med` while `Q2+ Avg/Med` is `-`.

## OBS Usage

Add `index.html` as a Browser Source. Recommended source settings:

- Local file or a locally served URL
- Transparent background
- Width around `720`
- Height around `120`

If your OBS/Chromium environment blocks `fetch("./config.json")` from a local
file, serve this folder with a local static server and use the localhost URL in
OBS.

Example:

```sh
python3 -m http.server 8000
```

Then use:

```text
http://localhost:8000/index.html
```

## Spreadsheet Functions

These formulas expect the run sheet columns to be:

| Column | Value |
| --- | --- |
| A | Quota Number |
| B | Day |
| C | Moon |
| D | Collected |
| E | Total |
| F | Gift Extra |
| G | Lost |
| H | Sold |
| I | New Quota |

Rows whose `Moon` is `71 Gordion` are excluded from the average and clear-rate stats.
`Q1` means `Quota Number` 1, and `Q2+` means all rows whose `Quota Number` is 2 or greater.

### Ship Total

```text
=IFERROR(
  SUM(INDIRECT("'" & Config!B1 & "'!D:D"))
  + SUM(INDIRECT("'" & Config!B1 & "'!F:F"))
  - SUM(INDIRECT("'" & Config!B1 & "'!G:G"))
  - SUM(INDIRECT("'" & Config!B1 & "'!H:H")),
  "-"
)
```

### Q1 Avg/Med

```text
=IFERROR(
  LET(
    values,
      FILTER(
        INDIRECT("'" & Config!B1 & "'!D:D"),
        INDIRECT("'" & Config!B1 & "'!A:A") = 1,
        INDIRECT("'" & Config!B1 & "'!C:C") <> "71 Gordion",
        ISNUMBER(INDIRECT("'" & Config!B1 & "'!D:D"))
      ),
    FLOOR(AVERAGE(values)) & "/" & FLOOR(MEDIAN(values))
  ),
  "-"
)
```

### Q2+ Avg/Med

```text
=IFERROR(
  LET(
    values,
      FILTER(
        INDIRECT("'" & Config!B1 & "'!D:D"),
        INDIRECT("'" & Config!B1 & "'!A:A") >= 2,
        INDIRECT("'" & Config!B1 & "'!C:C") <> "71 Gordion",
        ISNUMBER(INDIRECT("'" & Config!B1 & "'!D:D"))
      ),
    FLOOR(AVERAGE(values)) & "/" & FLOOR(MEDIAN(values))
  ),
  "-"
)
```

### Clear

```text
=IFERROR(
  LET(
    collected,
      FILTER(
        INDIRECT("'" & Config!B1 & "'!D:D"),
        INDIRECT("'" & Config!B1 & "'!C:C") <> "71 Gordion",
        ISNUMBER(INDIRECT("'" & Config!B1 & "'!D:D"))
      ),
    total,
      FILTER(
        INDIRECT("'" & Config!B1 & "'!E:E"),
        INDIRECT("'" & Config!B1 & "'!C:C") <> "71 Gordion",
        ISNUMBER(INDIRECT("'" & Config!B1 & "'!E:E"))
      ),
    TEXT(SUM(collected) / SUM(total), "0.0 %")
  ),
  "-"
)
```

## Third-Party Software

This overlay bundles `assets/3270-Regular.ttf` from
[rbanffy/3270font](https://github.com/rbanffy/3270font).
The complete attribution and license notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

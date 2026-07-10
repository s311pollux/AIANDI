# AIANDI Plant Operations Dashboard

A config-driven, drag-and-drop industrial dashboard starter.

## Run locally

Use a simple local web server. From the project folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Main files

- `index.html` - page shell
- `css/dashboard.css` - dashboard styling
- `js/app.js` - widget rendering and drag/drop behavior
- `config/dashboard.json` - dashboard pages and widgets

## Next steps

1. Add real PLC/API data source.
2. Save layouts to local storage or a backend endpoint.
3. Add widget editor modal.
4. Add trends and historian support.

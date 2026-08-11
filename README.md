# Cropstack

A browser-based tool for cropping multiple passport photos out of a single scanned
sheet, resizing them all to one target output size, and exporting the results — no
server, everything runs client-side.

## What it does

- Upload a scanned sheet containing multiple passport photos.
- Draw a crop box over each passport on the sheet — all boxes are visible and
  editable at the same time.
- Set one target output size (width × height); resizing a box snaps it to that
  aspect ratio.
- Click **Crop All** to crop and resize every box in one go.
- Rename each result, then download individually or as a single zip.

## Running locally

```bash
npm install
npm run dev
```

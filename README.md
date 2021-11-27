# Packagebrowser

A simple web app for parsing and browsing Debian/Ubuntu systems /var/lib/dpkg/status -file (a file that holds information about operating systems software packages). Contains a single-page-app frontend and a server that handles the parsing. By default uses file from system where server process is being ran, but uses [sample file](https://gist.github.com/lauripiispanen/29735158335170c27297422a22b48caa) if file is not present in system.

Demo runs in Google Cloud: https://packagebrowser-opljjm5qra-oa.a.run.app/

## ✔️ Requirements

To run packagebrowser locally, you need node (v16+) with npm (v7+). To run Dockerized version, Docker version 20 should be enough.

## ⌨️ Installation and development

Considering that a itself is quite simple, all dependencies and scripts are located in same package.json. Installing and starting development setup is done with following commands:

1. Install packages with `npm install`
2. Start development setup with `npm run dev`

Frontend runs in port 8080 and backend in port 8081.

If needed, frontend and backend can be built with `build:client` and `build:server` respectively.

Every push to `main` branch builds new version to GCP. Push carefully :)

## Deployment

Repository contains a very minimalistic Dockerfile, which can be used for deployment. Frontend is served directly from backend as a static asset. You can build app with e.g. `docker build -t packagebrowser:latest .`. App runs on port 8080 by default, but can be customized with PORT environment variable, e.g. `docker run -p 3001:3001 -e PORT=3001 --name packagebrowser packagebrowser:latest`

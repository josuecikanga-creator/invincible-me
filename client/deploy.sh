#!/bin/bash
# Deploy script for GitHub Pages
# This sets the API URL to your Render service before building

export VITE_API_BASE=https://invincible-me.onrender.com/api
npm run build
npx gh-pages -d dist


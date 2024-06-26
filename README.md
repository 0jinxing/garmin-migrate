# Garmin activities migrate

🌍 佳明国内账号同步到国际账号

## Usage

```bash
export GARMIN_CN_CONNECT_USERNAME="";
export GARMIN_CN_CONNECT_PASSWORD="";

export GARMIN_CONNECT_USERNAME="";
export GARMIN_CONNECT_PASSWORD="";

npx garmin-migrate
```

🎊 配合 github action, 简单好用

```yaml
name: Garmin Migrate

on:
  schedule:
    - cron: "*/30 * * * *"
  push:
    branches:
      - main

jobs:
  migrate:
    runs-on: ubuntu-latest
    env:
      GARMIN_CN_CONNECT_USERNAME: ${{ secrets.GARMIN_CN_CONNECT_USERNAME }}
      GARMIN_CN_CONNECT_PASSWORD: ${{ secrets.GARMIN_CN_CONNECT_PASSWORD }}
      GARMIN_CONNECT_USERNAME: ${{ secrets.GARMIN_CONNECT_USERNAME }}
      GARMIN_CONNECT_PASSWORD: ${{ secrets.GARMIN_CONNECT_PASSWORD }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm start
```
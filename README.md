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
steps:
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npm ci
- run: npm run start
```
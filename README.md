# boly

An Electron application with Vue and TypeScript

## Auto-Update Configuration

This application uses `electron-updater` to check for and apply updates from GitHub releases. To set up auto-updates:

1. Create a GitHub Personal Access Token with `repo` scope at https://github.com/settings/tokens
2. Add the token to your `.env` file:
   ```
   GH_TOKEN=your_token_here
   ```
3. When creating releases on GitHub, follow the semver versioning (e.g., v1.0.1)
4. Make sure the GitHub repository is properly configured in `package.json` and `electron-builder.yml`

For more information about electron-updater, see the [documentation](https://www.electron.build/auto-update).

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
#   b o l y - d e s k t o p - a p p 
 
 
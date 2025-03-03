# eslint config method

## download eslint

`pnpm add -D -w eslint`

## eslint init

`pnpm eslint --init`

## init print, no install dependencies.
monorepo Install may encounter errors, Custom installation required.
```
√ How would you like to use ESLint? · problems
√ What type of modules does your project use? · esm
√ Which framework does your project use? · vue
√ Does your project use TypeScript? · typescript
√ Where does your code run? · browser, node
The config that you've selected requires the following dependencies:

eslint, globals, @eslint/js, typescript-eslint, eslint-plugin-vue
√ Would you like to install them now? · No
Successfully created {this demo path}\eslint.config.js file.
You will need to install the dependencies yourself.
```

## Install dependencies
`pnpm add -D -w eslint globals @eslint/js typescript-eslint eslint-plugin-vue`
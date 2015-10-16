# Enviroment

- ES6(ES2015)
- Chrome Extension

## Devtools

- [jspm](http://jspm.io/)
- [systemjs](https://github.com/systemjs/systemjs)
- [babel](https://babeljs.io/)
- [grunt](http://gruntjs.com/)
- [mocha](https://mochajs.org/)
- [chai](http://chaijs.com/)
- [jshint](http://jshint.com/about/)
- [jscs](http://jscs.info/)

# Prepare

```bash
$ npm install jspm grunt-cli -g
$ npm install
$ jspm install
```

# Development

```bash
$ grunt compile
```

# Test

```bash
$ grunt test
```

# Build

```bash
$ grunt build
```

## Release Build

```bash
$ grunt build:release
```

and check ``packages`` directory.

# Thanks

- [StreamusChromeExtension](https://github.com/MeoMix/StreamusChromeExtension): based from this project.

const deepExtend = require('deep-extend');
const { isString, isObject, isArray } = require('valid-types');
const { setMode } = require('@rockpack/utils');
const errors = require('../errors/libraryCompiler');
const errorHandler = require('../errorHandler');
const _compile = require('../core/_compile');

// eslint-disable-next-line default-param-last
async function libraryCompiler(libraryOpts, conf, cb, configOnly = false) {
  setMode(['development', 'production'], 'development');
  if (!conf) {
    conf = {};
  }

  conf.__library = true;

  errorHandler();
  let libraryName = false;

  if (isString(libraryOpts)) {
    libraryName = libraryOpts;
  } else if (isObject(libraryOpts) && isString(libraryOpts.name)) {
    if (isArray(libraryOpts.externals) && libraryOpts.externals.length > 0) {
      conf.externals = libraryOpts.externals;
    }

    libraryName = libraryOpts.name;
    if (isObject(libraryOpts.esm)) {
      deepExtend(conf, {
        esm: libraryOpts.esm
      });
    }
    if (isObject(libraryOpts.cjs)) {
      deepExtend(conf, {
        cjs: libraryOpts.cjs
      });
    }
  } else {
    console.error(errors.LIBRARY_OPTS_ERROR);
    console.error(errors.MUST_BE_STRING);
    return process.exit(1);
  }

  if (!isString(libraryName)) {
    console.error(errors.MUST_BE_STRING);
    return process.exit(1);
  }

  conf = deepExtend({}, conf, {
    library: libraryName
  }, {
    html: !conf.html ? false : conf.html
  });

  conf.name = libraryCompiler.name;
  conf.compilerName = libraryCompiler.name;

  if (conf.nodejs) {
    conf = deepExtend({}, conf, {
      html: false,
      nodejs: true,
      __isBackend: true
    });
    return await _compile(conf, cb, configOnly);
  }
  return await _compile(conf, cb, configOnly);
}

module.exports = libraryCompiler;

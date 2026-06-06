const os = require('node:os')
const { withAppBuildGradle } = require('@expo/config-plugins')

/**
 * Config plugin that adds CMake arguments to app/build.gradle to raise
 * OBJECT_PATH_MAX and avoid the Windows 260-char path limit during native builds.
 */
const withMonorepoRoot = (config) => {
  return withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents

    if (!buildGradle.includes('CMAKE_OBJECT_PATH_MAX')) {
      const cmakeArgs = ['"-DCMAKE_OBJECT_PATH_MAX=1024"']
      if (os.platform() === 'win32') {
        cmakeArgs.unshift(String.raw`"-DCMAKE_MAKE_PROGRAM=C:\\ninja.exe"`)
      }

      buildGradle = buildGradle.replace(
        /defaultConfig \{/,
        `defaultConfig {\n        externalNativeBuild {\n            cmake {\n                arguments ${cmakeArgs.join(', ')}\n            }\n        }`
      )
    }

    config.modResults.contents = buildGradle
    return config
  })
}

module.exports = withMonorepoRoot

const { getDefaultConfig } = require('@expo/metro-config')

const config = getDefaultConfig(__dirname)

// Add "csv" to the list of recognized asset extensions
config.resolver.assetExts.push('csv')
// config.resolver.assetExts.push('json')

module.exports = config

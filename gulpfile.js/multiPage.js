const { envOptions } = require("./envOptions");
const { readdirSync } = require("fs");

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const folders = getDirectories(envOptions.srcPath);

exports.folders = folders;
exports.getMultiPageSrcPath = (src, folder) => {
  return src.map((s) => {
    return s.replace(envOptions.srcPath, envOptions.srcPath + `/${folder}`);
  });
};

exports.getMultiPageDistPath = (dist, folder) => {
  return dist.replace(envOptions.distPath, envOptions.distPath + `/${folder}`);
};

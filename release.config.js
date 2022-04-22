// eslint-disable-next-line no-undef
module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release-plus/docker",
      {
        name: {
          registry: "docker.io",
          namespace: "xilution",
          repository: "todd-coin-api",
        },
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md"],
        message: "chore(release): ${nextRelease.version}",
      },
    ],
    "@semantic-release/github",
  ],
};

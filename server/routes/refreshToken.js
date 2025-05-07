let refreshTokens = [];

function addRefreshToken(token) {
  refreshTokens.push(token);
}

function removeRefreshToken(token) {
  refreshTokens = refreshTokens.filter(t => t !== token);
}

function isValidRefreshToken(token) {
  return refreshTokens.includes(token);
}

module.exports = {
  addRefreshToken,
  removeRefreshToken,
  isValidRefreshToken,
};

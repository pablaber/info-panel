function addOptionsTo(url) {
  return {
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }
}

module.exports = {
  addOptionsTo
}
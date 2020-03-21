const generateMessage = (username,msg) => {
  return {
    username,
    msg,
    createdAt : new Date().getTime()
  }
}

const generateLocation = (username,lat, long) => {
  return {
    username,
    url: `https://google.com/maps?q=${lat},${long}`,
    createdAt : new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocation
}
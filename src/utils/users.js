const users = []

const addUser = ({id , username , room}) => {

  if(!username || !room ) {
    return{
      err : 'Pls provide both username and password'
    }
  }

  username = username.trim().toLowerCase()
  
  const existingUser = users.find(user => {return user.room === room && user.username === username})
  
  if(existingUser){
    return{
      err: 'Gommen but user already exists'
    }
  }
  const user = {username,room,id}
    users.push(user)
    return {user}

}

const removeUser = (userId) => {
  
  const index = users.findIndex( user => user.id === userId)

  if(index !== -1){
    return  users.splice(index,1)[0]
  }
  
}



const getUser = (userId) => {
  return users.find(user => user.id === userId)
}

const getUsersInRoom = (room) => {
  
  return users.filter( user => user.room === room)

}


module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}
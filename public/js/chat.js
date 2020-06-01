const socket = io()
const $messageForm = document.querySelector('.form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('.location')
const $messages = document.querySelector('#messages-box')
const $messagesContainer = document.querySelector('.chat-box')

//templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const myMessageTemplate = document.querySelector('#my-message-template').innerHTML
const myLocationTemplate = document.querySelector('#my-location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room} = Qs.parse(location.search , {ignoreQueryPrefix : true})

const autoScroll = () => {

  //the latest element
  const $newMessage = $messagesContainer.lastElementChild


  //height of message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom) + 
                            parseInt(newMessageStyles.marginTop)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //actual visible height of messages container

  const visibleHeight = $messagesContainer.offsetHeight

  //total height of messages container

  const totalHeight = $messagesContainer.scrollHeight

  //how far actually scrolled

  const scrollOffset = $messagesContainer.scrollTop + visibleHeight

  if(totalHeight - newMessageHeight <= scrollOffset){
    $messagesContainer.scrollTop = $messagesContainer.scrollHeight
  }

}

socket.on('message',( data ) => {
 
  const html = Mustache.render(messageTemplate,{
    username:data.username,
    mes: data.msg,
    createdAt : moment(data.createdAt).format('h:mm a')
   })

  $messages.insertAdjacentHTML('beforeend',html)
  autoScroll()
})

socket.on('myMessage',(data) => {

  const html = 
  Mustache.render(myMessageTemplate,{
    username:data.username,
    mes: data.msg,
    createdAt : moment(data.createdAt).format('h:mm a')
   })

  $messages.insertAdjacentHTML('beforeend',html)
  autoScroll()
})

socket.on('location',(data) => {

  const html = Mustache.render(locationTemplate,{
    username:data.username,
    url : data.url,
    createdAt : moment(data.createdAt).format('h:mm a')
  })

  $messages.insertAdjacentHTML('beforeend',html)
  autoScroll()

})

socket.on('myLocation',(data) => {

  const html = Mustache.render(myLocationTemplate,{
    username:data.username,
    url : data.url,
    createdAt : moment(data.createdAt).format('h:mm a')
  })

  $messages.insertAdjacentHTML('beforeend',html)
  autoScroll()

})

socket.on('roomData',(data) => {
  const html = Mustache.render(sidebarTemplate,{room:data.room,users:data.users})
  document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e) => {
  e.preventDefault()

  // Disabling the form
  $messageFormButton.setAttribute('disabled','disabled')

  const message = $messageFormInput.value
  socket.emit('userMessaged',message,(error) => {
    
    // enabling the form
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if(error){
      return console.log(error)
    }

    console.log('Wakatayo')

  })
})

$sendLocationButton.addEventListener('click',() =>{
  
  if(!navigator.geolocation){
    alert('gomen service not applicaple due to old browser')
  }

  $sendLocationButton.setAttribute('disabled','disabled')
  
  navigator.geolocation.getCurrentPosition((pos) => {
   
    socket.emit('sendLocation',{
      lat : pos.coords.latitude,
      long : pos.coords.longitude
    },
    () => {
       $sendLocationButton.removeAttribute('disabled')
       console.log('Location Shared')
    })

  })  

})

socket.emit('join', {username,room},(err) => {
  if(err){
    console.log('here')
    alert(err)
    location.href = '/'
  }
})
const socket = io('/');
const myPeer = new Peer(undefined, {
  host: '/',
  port: 3001
});

const peers = {};
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);

  myPeer.on('call', call => {
    call.answer(stream);

    const videoElement = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(videoElement, userVideoStream);
    });
  });

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  });
});

socket.on('user-disconnected', userId => {
  if(peers[userId]) {
    peers[userId].close();
  }
});

myPeer.on('open', id => {
  socket.emit('join-room', roomId, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');

  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });

  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(videoElement, stream) {
  videoElement.srcObject = stream;

  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play();
  });

  videoGrid.append(videoElement);
}